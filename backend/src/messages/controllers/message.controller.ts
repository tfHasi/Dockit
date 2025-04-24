import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messageService.create(createMessageDto, req.user.userId);
  }

  @Get()
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    if (page) {
      return this.messageService.findRecentMessages(page, limit);
    }
    return this.messageService.findAll();
  }
}