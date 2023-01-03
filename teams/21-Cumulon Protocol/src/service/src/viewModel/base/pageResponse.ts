import { ApiProperty } from '@nestjs/swagger';

export class PageResponse {
  @ApiProperty({ description: 'total count of records' })
  public totalCount: number;
}
