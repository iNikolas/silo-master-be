import { Injectable } from '@nestjs/common';
import { CommandHandlerService } from './command-handler/command-handler.service';
import { CommandDto } from './command-handler/dto/command.dto';

@Injectable()
export class AppService {
  constructor(private readonly commandHandlerService: CommandHandlerService) {}

  async getState(): Promise<string> {
    const command = { c: 'gs' };
    return await this.commandHandlerService.sendCommand(command);
  }

  async sendCommand(command: CommandDto): Promise<string> {
    return await this.commandHandlerService.sendCommand(command);
  }
}
