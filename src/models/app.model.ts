import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type AppDocument = HydratedDocument<App>;

@Schema({ timestamps: true })
export class App {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, index: true })
  createdBy: string;

  @Prop({ required: true, unique: true, index: true })
  clientId: string;

  @Prop({ required: true })
  clientSecret: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AppSchema = SchemaFactory.createForClass(App);

AppSchema.pre('save', async function () {
  if (!this.isModified('clientSecret')) return;
  const salt = await bcrypt.genSalt(10);
  this.clientSecret = await bcrypt.hash(this.clientSecret, salt);
});
