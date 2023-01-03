import { ApiProperty } from '@nestjs/swagger';
import { OrderBy } from './orderBy';

export class PageRequest {
  constructor() {
    console.log('PageRequest constructor ');
  }

  @ApiProperty({ description: 'record size per page', default: 10 })
  public pageSize: number = 10;
  @ApiProperty({ description: 'page index', default: 1 })
  public pageIndex: number = 1;

  public static getSkip(instance): number {
    var skip = (instance.pageSize || 10) * (instance.pageIndex - 1 || 0);
    if (skip < 0) {
      skip = 0;
    }
    return skip;
  }
  public static getTake(instance): number {
    if (instance.pageSize <= 0) {
      instance.pageSize = 10;
    }
    return instance.pageSize;
  }

  @ApiProperty({ default: [], type: [OrderBy] })
  public orderBys: OrderBy[];
}
