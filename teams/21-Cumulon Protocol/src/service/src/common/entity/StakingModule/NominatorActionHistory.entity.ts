import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'nominator_action_histories' })
@Index(['roundindex', 'account'])
export class NominatorActionHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ comment: 'round index' })
    roundindex: number;

    @ApiProperty()
    @Column({ comment: 'nominator account' })
    account: string;

    @ApiProperty()
    @Column({ comment: 'nomination collator account' })
    collator: string;

    @ApiProperty()
    @Column({ comment: '' })
    actiontype: string;

    @ApiProperty()
    @Column({
        comment: 'balance change',
        type: 'decimal',
        precision: 30,
        scale: 5,
    })
    balancechange: number;

    @ApiProperty()
    @Column({
        comment: 'current balance after apply change',
        type: 'decimal',
        precision: 30,
        scale: 5,
    })
    balancecurrent: number;


    @ApiProperty()
    @Column({ comment: 'the block number of current action', type: 'bigint' })
    blocknumber: number;

    @ApiProperty()
    @Column({ comment: 'the timestamp of current action', default: '2021-01-01T12:29:33.421' })
    timestamp: string = '2021-01-01T12:29:33.421';


}