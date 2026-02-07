import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WebhookDocument = HydratedDocument<Webhook>;

@Schema({ timestamps: true })
export class Webhook {
  @Prop({ required: true, unique: true })
  webhookUrl: string;

  @Prop({ required: true, unique: true, index: true })
  webhookSecret: string;

  @Prop({ required: true, ref: 'App' })
  appId: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
