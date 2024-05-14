import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SerialPortService } from '../serial-port/serial-port.service';

@Injectable()
export class CommandHandlerService {
  private cachedResponse: string;
  private cacheExpirationMs: number;
  private cacheUpdatedTimestamp: number;

  constructor(
    private readonly serialPortService: SerialPortService,
    private readonly configService: ConfigService,
  ) {
    this.cacheExpirationMs = parseInt(
      this.configService.get<string>('CACHE_EXPIRATION_MS'),
    );
  }

  async sendCommand(command: any): Promise<string> {
    if (
      this.cachedResponse &&
      !this.isCacheExpired() &&
      command.command === 'gs'
    ) {
      return this.cachedResponse;
    }

    try {
      const response = await this.writeCommand(command);

      this.updateCache(response);
      return response;
    } catch (errorMessage) {
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async writeCommand(command: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          this.serialPortService.initPort();
          reject('No response from the Board. Please retry.');
        },
        parseInt(this.configService.get<string>('TIMEOUT_MS')),
      );

      this.serialPortService.port.write(JSON.stringify(command), (err) => {
        clearTimeout(timeout);
        if (err) {
          reject(err.message);
        }
      });

      this.serialPortService.parser.once('data', (data: string) => {
        clearTimeout(timeout);
        const parsedData = JSON.parse(data);

        if (parsedData.error) {
          reject(parsedData.error);
        }

        resolve(data);
      });
    });
  }

  private updateCache(response: string) {
    this.cachedResponse = response;
    this.cacheUpdatedTimestamp = Date.now();
    setTimeout(() => {
      this.cachedResponse = null;
    }, this.cacheExpirationMs);
  }

  private isCacheExpired(): boolean {
    const cacheUpdatedTimestamp = this.cacheUpdatedTimestamp ?? 0;
    return (
      !this.cachedResponse ||
      !this.cacheExpirationMs ||
      Date.now() > cacheUpdatedTimestamp + this.cacheExpirationMs
    );
  }
}
