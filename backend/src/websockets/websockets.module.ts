import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { MessageService } from '../messages/message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../messages/message.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]), // Direct schema access
  ],
  providers: [ChatGateway, MessageService], // Provide MessageService here
  exports: [ChatGateway],
})
export class WebsocketsModule {}