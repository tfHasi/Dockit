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
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, ConnectedUser>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;
      console.log('Cookies received:', cookies);
      if (!cookies) {
        throw new Error('No cookies found');
      }
      
      // Parse the cookie string to find JWT
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
      
      // Store user by userId instead of socket ID for better tracking
      this.onlineUsers.set(userId, { socket: client, userId, nickname });
  
      // Broadcast updated user list immediately after a new connection
      this.broadcastOnlineUsers();
      console.log(`User connected: ${nickname} (${userId}) with socket ${client.id}`);
    } catch (err) {
      console.log('Unauthorized connection attempt:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove the user by socket ID
    let userIdToRemove: string | null = null;
    
    for (const [userId, userData] of this.onlineUsers.entries()) {
      if (userData.socket.id === client.id) {
        userIdToRemove = userId;
        break;
      }
    }
    
    if (userIdToRemove) {
      this.onlineUsers.delete(userIdToRemove);
      console.log(`Client disconnected: ${client.id} (User: ${userIdToRemove})`);
    } else {
      console.log(`Unknown client disconnected: ${client.id}`);
    }
    
    // Broadcast updated user list after a disconnection
    this.broadcastOnlineUsers();
  }

  private broadcastOnlineUsers() {
    const users = Array.from(this.onlineUsers.values()).map(u => ({
      userId: u.userId,
      nickname: u.nickname,
    }));
    
    console.log(`Broadcasting ${users.length} online users`);
    this.server.emit('onlineUsers', users);
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(client: Socket) {
    const users = Array.from(this.onlineUsers.values()).map(u => ({
      userId: u.userId,
      nickname: u.nickname,
    }));
    
    // Send online users list directly to the requesting client
    client.emit('onlineUsers', users);
  }
  
  // Public method that can be called from MessageController to broadcast a new message
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
      // This is a simpler version that just triggers a refresh
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