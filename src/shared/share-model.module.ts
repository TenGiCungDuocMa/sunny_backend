import { PlayerModel, PlayerSchema } from "./schemas/player.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlayerModel.name, schema: PlayerSchema },
    ]),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class SharedModelModule {}
