import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColyseusModule } from './colyseus/colyseus.module';

@Module({
  imports: [ColyseusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
