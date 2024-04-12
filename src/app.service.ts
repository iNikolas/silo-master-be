// app.service.ts

import { Injectable } from '@nestjs/common';
import { CommandHandlerService } from './command-handler/command-handler.service';

@Injectable()
export class AppService {
  constructor(private readonly commandHandlerService: CommandHandlerService) {}

  async getState(): Promise<string> {
    const command = { command: 'getState' };
    return await this.commandHandlerService.sendCommand(command);
  }
}
