import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Conversation.name, schema: ConversationSchema },
    { name: Message.name, schema: MessageSchema },

  ])],
  providers: [MessagingGateway, MessagingService],
})
export class MessagingModule {}
