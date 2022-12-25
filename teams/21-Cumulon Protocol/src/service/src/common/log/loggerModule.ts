import { Global, Module } from '@nestjs/common';
import { W3Logger } from './logger.service';

@Global()
@Module({
  providers: [W3Logger],
  exports: [W3Logger],
})
export class LoggerModule { }
