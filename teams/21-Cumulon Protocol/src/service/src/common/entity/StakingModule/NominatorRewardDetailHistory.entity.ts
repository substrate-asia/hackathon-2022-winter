import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'nominator_reward_detail_histories' })
@Index(['realroundindex', 'account', 'collator'])
export class NominatorRewardDetailHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ comment: 'real blocks calculated for reward, but the reward has not been transfered yet, still need to wait for 2 rounds later', type: 'bigint' })
    realroundindex: number;

    @ApiProperty()
    @Column({ comment: 'nominator' })
    account: string;

    @ApiProperty()
    @Column({ comment: 'collator' })
    collator: string;

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


    @ApiProperty()
    @Column({ name: 'issueblock', comment: 'the blocknumber which the reward will be transfered', type: 'bigint' })
    issueBlock: number;

    @ApiProperty()
    @Column({ comment: 'the round index which the reward will be transfered', type: 'bigint' })
    issueroundindex: number;

}
