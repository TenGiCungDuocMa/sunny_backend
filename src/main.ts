import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { ChatRoom } from './colyseus/rooms/chat.room';
import { playground } from '@colyseus/playground';
import { monitor } from '@colyseus/monitor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  const server = createServer(expressApp);
  const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
  });

  gameServer.define("my_room", ChatRoom);

  expressApp.use('/playground', playground());
  expressApp.use('/monitor', monitor());

  await app.init();

  server.listen(2567, () => {
    console.log('Colyseus listening on ws://localhost:2567');
    console.log('Playground UI at http://localhost:2567/playground');
  });
}
bootstrap();
