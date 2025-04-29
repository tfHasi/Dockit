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
    const userId = req.user.userId;
    console.log(`REST API message creation from user ${userId}`);
    
    const message = await this.messageService.create(createMessageDto, userId);
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