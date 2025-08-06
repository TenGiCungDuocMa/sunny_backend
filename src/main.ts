import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { ChatRoom } from './colyseus/rooms/chat.room';
import { playground } from '@colyseus/playground';
import { monitor } from '@colyseus/monitor';
import { listen } from '@colyseus/tools';
import { LobbyRoom } from "colyseus";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  const server = createServer(expressApp);
  // game server( colyseus ) dùng chung cái express app này – để vừa chơi game vừa gọi API
  const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
  });
// config colyseus : Phòng mặc định để hiển thị danh sách các phòng
  gameServer.define("lobby", LobbyRoom);
  // gameServer.define("my_room", ChatRoom): Cho phép phòng được hiển thị & cập nhật realtime trong LobbyRoom
  gameServer.define("my_room", ChatRoom).enableRealtimeListing();
  // gameServer.define("my_room", ChatRoom).filterBy(['roomName']);

// config nestjs 
  expressApp.use('/playground', playground());
  expressApp.use('/monitor', monitor());

  // await listen(colyseusConfig, { server });
  await app.init();

  server.listen(2567, () => {
    console.log('Colyseus listening on ws://localhost:2567');
    console.log('Playground UI at http://localhost:2567/playground');
  });
}
bootstrap();
