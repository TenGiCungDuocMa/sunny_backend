import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
// import morgan from "morgan";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { GameService } from "./colyseus/colyseus.service";
import { SharedModelModule } from "./shared/share-model.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env.development", isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      }),
    }),
    SharedModelModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(morgan("combined")).forRoutes("*");
    consumer.apply(monitor()).forRoutes("/monitor");
    consumer.apply(playground()).forRoutes("/playground");
  }
}
