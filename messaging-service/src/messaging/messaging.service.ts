import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessagingService {
    constructor(@InjectModel(Message.name) private catModel: Model<Message>) {}

    
}
