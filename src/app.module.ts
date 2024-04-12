import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SerialPortService } from './serial-port/serial-port.service';
import { CommandHandlerService } from './command-handler/command-handler.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService, SerialPortService, CommandHandlerService],
})
export class AppModule {}
