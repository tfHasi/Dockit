import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { CreateMessageDto } from './create-message.dto';
import { UserService } from '../users/user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private userService: UserService,
  ) {}

  async create(createMessageDto: CreateMessageDto, userId: string): Promise<MessageDocument> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    
    const newMessage = new this.messageModel({
      text: createMessageDto.text,
      userId: new Types.ObjectId(userId),
      nickname: user.nickname,
    });
    
    return newMessage.save();
  }

  async findMessages(
    page: number = 1,
    limit: number = 20,
  ): Promise<MessageDocument[]> {
    const skip = (page - 1) * limit;
    return this.messageModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}