import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck(): string {
    return 'Everything is OK!';
  }
  getHello(): string {
    return 'Hello World!';
  }
}
