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

}


export const ConversationSchema = SchemaFactory.createForClass(Conversation);
