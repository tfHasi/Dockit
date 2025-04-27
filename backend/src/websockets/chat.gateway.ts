import {WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect,} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessageService } from '../messages/message.service';
import { AuthService } from '../auth/auth.service';
import { WsJwtGuard } from '../auth/auth.guards';

interface ConnectedUser {
  socket: Socket;
  userId: string;
  nickname: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
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
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      const payload = this.authService.verifyToken(token);

      const userId = payload.sub;
      const nickname = payload.nickname;

      client['user'] = payload;
      this.onlineUsers.set(client.id, { socket: client, userId, nickname });

      this.broadcastOnlineUsers();
      console.log(`User connected: ${nickname} (${client.id})`);
    } catch (err) {
      console.log('Unauthorized connection attempt');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineUsers();
    console.log(`Client disconnected: ${client.id}`);
  }

  private broadcastOnlineUsers() {
    const users = Array.from(this.onlineUsers.values()).map(u => ({
      userId: u.userId,
      nickname: u.nickname,
    }));
    this.server.emit('onlineUsers', users);
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
    } catch (error) {
      client.emit('error', { message: 'Failed to process message' });
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