import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UUID } from 'crypto';
import mongoose, { HydratedDocument } from 'mongoose';
import { Conversation } from './conversation.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({timestamps: true})
export class Message{

    // @Prop({
    //     required: true,
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Conversation'
    // })
    // conversation: Conversation

    @Prop({
        type: mongoose.Schema.Types.UUID,
        required: true,
        immutable: true
    })
    user_id: UUID;

    @Prop({
        type: mongoose.Schema.Types.UUID,
        required: true,
        immutable: true
    })
    contact_id: UUID;

    @Prop({
        required: true,
        enum: ["text", "image", "video", "audio", "file", "sticker", "product"],
        default: "text"
    })
    type: string

}

export const MessageSchema = SchemaFactory.createForClass(Message);