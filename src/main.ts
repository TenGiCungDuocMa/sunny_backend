/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ChatRoom } from "./colyseus/rooms/chat.room";
import { ExpressAdapter } from "@nestjs/platform-express";
import { GameService } from "./colyseus/colyseus.service";
import { Globals } from "./utils/globals";
import express from "express";
import * as http from "http";

const PORT = Number(process.env.PORT);
const ROOMS = [ChatRoom];

async function bootstrap() {
  const app = express();

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));
  nestApp.enableShutdownHooks();
  nestApp.enableCors();
  await nestApp.init();
  const httpServer = http.createServer(app);

  const gameSvc = nestApp.get(GameService);

  gameSvc.createServer(httpServer);

  ROOMS.forEach((r) => {
    console.info(`Registering room: ${r.name}`);
    gameSvc.defineRoom(r.name, r);
  });

  await gameSvc.listen(PORT).then(() => {
    console.info(
      `Application started on ${PORT} at ${new Date().toLocaleDateString()}`,
    );
    Globals.nestApp = nestApp;
  });
}
bootstrap();
