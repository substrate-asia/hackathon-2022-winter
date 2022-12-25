import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'reward_histories' })
@Index(['realroundindex', 'account'])
export class RewardHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ comment: 'real blocks calculated for reward, but the reward has not been transfered yet, still need to wait for 2 rounds later', type: 'bigint' })
    realroundindex: number;

    @ApiProperty()
    @Column({ comment: 'collator/nominator account' })
    account: string;

    @ApiProperty()
    @Column({ name: 'iscollator', comment: '1=current account is collator, default is 0', default: 0 })
    isCollator: number;

    @ApiProperty()
    @Column({ name: 'isnominator', comment: '1=current account is nominator, default is 0', default: 0 })
    isNominator: number;

    @ApiProperty()
    @Column({ name: 'issueblock', comment: 'the blocknumber which the reward will be transfered', type: 'bigint' })
    issueBlock: number;

    @ApiProperty()
    @Column({ comment: 'the round index which the reward will be transfered', type: 'bigint' })
    issueroundindex: number;

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