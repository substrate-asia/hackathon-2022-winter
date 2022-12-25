import { ApiProperty } from '@nestjs/swagger';

export class OrderBy {
  @ApiProperty({ description: 'the field name to sort with' })
  public sort: string;
  @ApiProperty({ description: 'the sort order for the field: ASC|DESC' })
  public order: 'ASC' | 'DESC';
}
