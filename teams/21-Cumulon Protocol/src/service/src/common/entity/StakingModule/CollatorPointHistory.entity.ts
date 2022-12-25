import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'collator_point_histories' })
@Index(['roundindex', 'account'])
export class CollatorPointHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ comment: 'round index' })
    roundindex: number;

    @ApiProperty()
    @Column({ comment: 'collator account' })
    account: string;


    @ApiProperty()
    @Column({ comment: ' ', type: 'int' })
    point: number;

    @ApiProperty()
    @Column({ comment: 'the block number when collator get current point ', type: 'bigint' })
    blocknumber: number;


}