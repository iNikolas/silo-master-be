import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SerialPortService } from '../serial-port/serial-port.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommandHandlerService {
  private timeout: NodeJS.Timeout;

  constructor(
    private readonly serialPortService: SerialPortService,
    private readonly configService: ConfigService,
  ) {}

  async sendCommand(command: any): Promise<string> {
    try {
      return await this.sendCommandWithTimeout(
        command,
        parseInt(this.configService.get<string>('TIMEOUT_MS')),
      );
    } catch (error) {
      console.error('Error sending command:', error.message);
      throw new HttpException(
        'Failed to send command',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async writeCommand(command: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.serialPortService.port.write(JSON.stringify(command), (err) => {
        if (err) {
          reject(err);
        }
      });

      this.serialPortService.port.once('data', (data) => {
        const jsonData = data.toString('utf-8');
        resolve(jsonData);
      });
    });
  }

  private async sendCommandWithTimeout(
    command: any,
    timeoutMs: number,
  ): Promise<string> {
    this.timeout = setTimeout(() => {
      this.serialPortService.initPort();
      const errorMessage = 'Timeout occurred while waiting for response';
      console.log(errorMessage);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }, timeoutMs);

    try {
      const responseData = await this.writeCommand(command);
      clearTimeout(this.timeout);
      return responseData;
    } catch (error) {
      clearTimeout(this.timeout);
      throw new HttpException(
        'Failed to send command',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
