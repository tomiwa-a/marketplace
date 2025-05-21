import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UUID } from 'crypto';
import mongoose, { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

enum ConversationStatus {
    ACTIVE,
    CLOSED

}

@Schema({timestamps: true})
export class Conversation{

    @Prop({
        type: [mongoose.Schema.Types.UUID],
        required: true,
        immutable: true
    })
    participants: UUID[];

    @Prop({
        enum: ConversationStatus,
        default: "active"
    })
    status: string

}


export const ConversationSchema = SchemaFactory.createForClass(Conversation);
