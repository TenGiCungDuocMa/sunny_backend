import { WebSocketGateway } from '@nestjs/websockets';
import { ColyseusService } from './colyseus.service';

@WebSocketGateway()
export class ColyseusGateway {
  constructor(private readonly colyseusService: ColyseusService) {}
}
