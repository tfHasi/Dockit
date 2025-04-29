import { Controller, Get, Post, Body, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './create-message.dto';
import { JwtAuthGuard } from '../auth/auth.guards';
import { ChatGateway } from '../websockets/chat.gateway';

@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const message = await this.messageService.create(createMessageDto, req.user.userId);
    
    // Broadcast the new message to all connected websocket clients
    this.chatGateway.broadcastNewMessage(message);
    
    return message;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.messageService.findMessages(page, limit);
  }
}