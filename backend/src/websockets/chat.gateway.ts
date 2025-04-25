import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessageService } from '../messages/message.service';
import { AuthService } from '../auth/auth.service';
import { WsJwtGuard } from '../auth/auth.guards';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { text: string }) {
    try {
      // User is now attached to the socket by the guard
      const userId = client['user'].sub;
      
      const message = await this.messageService.create(
        { text: payload.text },
        userId,
      );
      
      // Broadcast message to all clients
      this.server.emit('newMessage', {
        id: message._id,
        text: message.text,
        userId: message.userId,
        nickname: message.nickname,
        createdAt: message.createdAt,
      });
      
    } catch (error) {
      // Send error only to sender
      client.emit('error', { message: 'Failed to process message' });
    }
  }
}