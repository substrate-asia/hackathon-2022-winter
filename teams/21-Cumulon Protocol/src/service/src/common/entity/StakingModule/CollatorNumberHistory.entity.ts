import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'collator_number_histories' })
@Index(['roundindex'])
export class CollatorNumberHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;


    @ApiProperty()
    @Column({ comment: 'the block number when change collator number', type: 'bigint' })
    blocknumber: number;

    @ApiProperty()
    @Column({ comment: 'round index' })
    roundindex: number;

    @ApiProperty()
    @Column({
        comment: 'old collator number',
        type: 'int',
    })
    old: number;

    @ApiProperty()
    @Column({
        comment: 'new collator number',
        type: 'int',
    })
    new: number;

    @ApiProperty()
    @Column({ comment: 'the timestamp of current action', default: '2021-01-01T12:29:33.421' })
    timestamp: string = '2021-01-01T12:29:33.421';


}