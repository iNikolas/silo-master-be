import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SerialPort } from 'serialport';

@Injectable()
export class SerialPortService implements OnModuleDestroy {
  public port: SerialPort;

  constructor(private configService: ConfigService) {
    this.initPort();
  }

  async initPort() {
    await this.closePort();
    this.port = this.createPortInstance();
  }

  private createPortInstance(): SerialPort {
    return new SerialPort({
      path: this.configService.get<string>('PORT_PATH'),
      baudRate: parseInt(this.configService.get<string>('BAUD_RATE')),
      highWaterMark: parseInt(this.configService.get<string>('BUFFER_SIZE_KB')),
    });
  }

  async onModuleDestroy() {
    await this.closePort();
  }

  private async closePort() {
    if (this.port?.isOpen) {
      this.port.close();
    }
  }
}
