import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CommandDto } from './command-handler/dto/command.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getState(): Promise<string> {
    return this.appService.getState();
  }

  @Post('command')
  sendCommand(@Body() command: CommandDto): Promise<string> {
    return this.appService.sendCommand(command);
  }
}
