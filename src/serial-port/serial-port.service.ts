import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

@Injectable()
export class SerialPortService implements OnModuleDestroy {
  public port: SerialPort;
  public parser: ReadlineParser;
  private readonly logger = new Logger(SerialPortService.name);

  constructor(private configService: ConfigService) {
    this.initPort();
  }

  async initPort() {
    await this.closePort();
    try {
      this.port = this.createPortInstance();
      this.parser = this.port.pipe(this.createParserInstance());
      this.logger.log('Serial port initialized successfully');
    } catch (error) {
      this.logger.error(`Error initializing serial port: ${error.message}`);
    }
  }

  private createPortInstance(): SerialPort {
    return new SerialPort({
      path: this.configService.get<string>('PORT_PATH'),
      baudRate: parseInt(this.configService.get<string>('BAUD_RATE')),
    });
  }

  private createParserInstance(): ReadlineParser {
    return new ReadlineParser();
  }

  async onModuleDestroy() {
    await this.closePort();
  }

  private async closePort() {
    if (this.port?.isOpen) {
      this.port.close();
      this.logger.log('Serial port closed');
    }
  }
}
