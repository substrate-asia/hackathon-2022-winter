import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'round_infos' })
@Index(['roundindex'])
export class RoundInfo {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ comment: 'round index' })
    roundindex: number;

    @ApiProperty()
    @Column({name:'numberofcollator', comment: 'the number of collators when this round start' })
    numberOfCollator: number;

    @ApiProperty()
    @Column({
        comment: 'the total stake amount of current round ',
        type: 'decimal',
        precision: 30,
        scale: 5,
    })
    totalbond: number;

    @ApiProperty()
    @Column({ comment: 'the start block number of current round', type: 'bigint' })
    startblock: number;

    @ApiProperty()
    @Column({ comment: 'the start timestamp of current round', default: '2021-01-01T12:29:33.421' })
    timestamp: string = '2021-01-01T12:29:33.421';
}