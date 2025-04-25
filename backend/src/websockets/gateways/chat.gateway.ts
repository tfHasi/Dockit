import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { UseGuards } from '@nestjs/common';
  import { MessageService } from '../../messages/services/message.service';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { AuthService } from '../../auth/services/auth.service';
  
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
  
    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: { text: string; token: string }) {
      try {
        // Verify token and get user ID
        const decodedToken = this.authService.verifyToken(payload.token);
        const message = await this.messageService.create(
          { text: payload.text },
          decodedToken.sub,
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
        client.emit('error', { message: 'Authentication failed' });
      }
    }
  }