import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './message.schema';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { UsersModule } from '../users/users.module';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UsersModule,
    WebsocketsModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessagesModule {}