import {
  Controller,
  Get,
  Req,
  Param,
  Query,
  Res,
  Post,
  Body,
  Header,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import * as C from './config';

@Controller('hackathon')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Header('Access-Control-Allow-Origin', '*')
  @Get('check/:address?')
  async check(
    @Res() res: Response,
    @Param('address') params: string,
  ): Promise<any> {
    try {
      const r = await this.appService.check(params);
      res.setHeader('Content-Type', 'application/json').status(200).json(r);
    } catch (error) {
      res.setHeader('Content-Type', 'application/json').status(500).json([]);
    }
  }

  @Header('Access-Control-Allow-Origin', '*')
  @Post('update')
  async update(@Res() res: Response, @Body() body: C.P): Promise<any> {
    try {
      await this.appService.update(body);
      res
        .setHeader('Content-Type', 'application/json')
        .status(200)
        .json({ update: 'ok' });
    } catch (error) {
      res
        .setHeader('Content-Type', 'application/json')
        .status(500)
        .json({ update: 'error' });
    }
  }

  @Header('Access-Control-Allow-Origin', '*')
  @Post('add')
  async add(@Res() res: Response, @Body() body: C.P): Promise<any> {
    try {
      console.log(body);
      await this.appService.add(body);
      res
        .setHeader('Content-Type', 'application/json')
        .status(200)
        .json({ update: 'ok' });
    } catch (error) {
      res
        .setHeader('Content-Type', 'application/json')
        .status(500)
        .json({ update: 'error' });
    }
  }
}
