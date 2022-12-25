import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'collator_reward_histories' })
@Index(['realroundindex', 'account'])
export class CollatorRewardHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;


    @ApiProperty()
    @Column({ comment: 'collator/nominator account' })
    account: string;

    @ApiProperty()
    @Column({ comment: 'the round index which the reward will be transfered', type: 'bigint' })
    issueroundindex: number;
    @ApiProperty()
    @Column({ name: 'issueblock', comment: 'the blocknumber which the reward will be transfered', type: 'bigint' })
    issueBlock: number;


    @ApiProperty()
    @Column({ type: 'bigint' })
    realroundindex: number;

    @ApiProperty()
    @Column({
        comment: 'balance of reward',
        type: 'decimal',
        precision: 30,
        scale: 5,
    })
    balance: number;

    @ApiProperty()
    @Column({ comment: 'the timestamp of current action', default: '2021-01-01T12:29:33.421' })
    timestamp: string = '2021-01-01T12:29:33.421';

}