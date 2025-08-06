import { Module } from '@nestjs/common';
import { ColyseusService } from './colyseus.service';
import { ColyseusGateway } from './colyseus.gateway';

@Module({
  providers: [ColyseusGateway, ColyseusService],
})
export class ColyseusModule {}
