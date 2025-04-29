import {WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { MessageService } from '../messages/message.service';
import { AuthService } from '../auth/auth.service';
import { WsJwtGuard } from '../auth/auth.guards';

interface ConnectedUser {
  socket: Socket;
  userId: string;
  nickname: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, ConnectedUser>();
  private socketToUserId = new Map<string, string>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;
      if (!cookies) {
        throw new Error('No cookies found');
      }
      const cookieArray = cookies.split(';').map(cookie => cookie.trim());
      const jwtCookie = cookieArray.find(cookie => cookie.startsWith('jwt='));
      
      if (!jwtCookie) {
        throw new Error('JWT cookie not found');
      }
      
      const token = jwtCookie.split('=')[1];
      const payload = this.authService.verifyToken(token);
  
      const userId = payload.sub;
      const nickname = payload.nickname;
  
      client['user'] = payload;

      this.onlineUsers.set(userId, { socket: client, userId, nickname });
      this.socketToUserId.set(client.id, userId);
      this.broadcastOnlineUsers();
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUserId.get(client.id);
    
    if (userId) {
      this.onlineUsers.delete(userId);
      this.socketToUserId.delete(client.id);
    } else {
      console.log(`Unknown client disconnected: ${client.id}`);
    }
    this.broadcastOnlineUsers();
  }

  private broadcastOnlineUsers() {
    const users = Array.from(this.onlineUsers.values()).map(u => ({
      userId: u.userId,
      nickname: u.nickname,
    }));
    
    this.server.emit('onlineUsers', users);
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(client: Socket) {
    const users = Array.from(this.onlineUsers.values()).map(u => ({
      userId: u.userId,
      nickname: u.nickname,
    }));

    client.emit('onlineUsers', users);
  }
  

  broadcastNewMessage(message: any) {
    this.server.emit('newMessage', {
      id: message._id,
      text: message.text,
      userId: message.userId,
      nickname: message.nickname,
      createdAt: message.createdAt,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('messageNotification')
  async handleMessageNotification(client: Socket) {
    try {
      client.broadcast.emit('refreshMessages');
      return { success: true };
    } catch (error) {
      client.emit('error', { message: 'Failed to notify about new message' });
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { text: string }) {
    try {
      const userId = client['user'].sub;
      const message = await this.messageService.create({ text: payload.text }, userId);
      this.server.emit('newMessage', {
        id: message._id,
        text: message.text,
        userId: message.userId,
        nickname: message.nickname,
        createdAt: message.createdAt,
      });
      
      return { success: true };
    } catch (error) {
      client.emit('error', { message: 'Failed to process message' });
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { isTyping: boolean }) {
    const user = client['user'];
    if (!user) return;

    client.broadcast.emit('userTyping', {
      userId: user.sub,
      nickname: user.nickname,
      isTyping: payload.isTyping,
    });
  }
}