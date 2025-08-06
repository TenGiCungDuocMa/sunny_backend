/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ChatRoom } from "./colyseus/rooms/chat.room";
import { ExpressAdapter } from "@nestjs/platform-express";
import { GameService } from "./colyseus/colyseus.service";
import { Globals } from "./utils/globals";
import express from "express";
import * as http from "http";
import { LobbyRoom } from "colyseus";

const PORT = Number(process.env.PORT);
const ROOMS = [ChatRoom];

async function bootstrap() {
  const app = express();


  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));
  nestApp.enableShutdownHooks();
  nestApp.enableCors();
  await nestApp.init();
  const httpServer = http.createServer(app);
  // game server( colyseus ) dùng chung cái express app này – để vừa chơi game vừa gọi API
  const gameSvc = nestApp.get(GameService);

  gameSvc.createServer(httpServer);

  ROOMS.forEach((r) => {
    console.info(`Registering room: ${r.name}`);
    gameSvc.defineRoom(r.name, r);
  });
// config colyseus : Phòng mặc định để hiển thị danh sách các phòng
  gameSvc.defineRoom("lobby", LobbyRoom);
  // gameServer.define("my_room", ChatRoom): Cho phép phòng được hiển thị & cập nhật realtime trong LobbyRoom
  gameSvc.enableRealtimeListing("my_room", ChatRoom);
  // gameServer.define("my_room", ChatRoom).filterBy(['roomName']);


  await gameSvc.listen(PORT).then(() => {
    console.info(
      `Application started on ${PORT} at ${new Date().toLocaleDateString()}`,
    );
    Globals.nestApp = nestApp;
  });
}
bootstrap();
