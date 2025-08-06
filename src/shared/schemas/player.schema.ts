import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsDate, IsString } from "class-validator";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class PlayerModel extends Document {
  @Prop({ type: "string" })
  @IsString()
  roomId: string;

  @Prop({ type: "string", default: "Anonymous" })
  @IsString()
  name: string;

  @Prop({ type: "string" })
  @IsString()
  message: string;

  @Prop()
  @IsDate()
  createdAt: Date;

  @Prop()
  @IsDate()
  updatedAt: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(PlayerModel);
