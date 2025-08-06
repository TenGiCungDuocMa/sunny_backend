import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { playground } from '@colyseus/playground';
import { monitor } from '@colyseus/monitor';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("playground")
  async getPlayground(@Res() res: Response) {
    return playground(); 
  }

  @Get('monitor')
  async getMonitor(@Res() res: Response) {
    return monitor(); 
  }
}
