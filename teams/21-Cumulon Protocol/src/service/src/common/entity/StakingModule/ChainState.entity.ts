import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'chain_state' })
export class ChainState {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ comment: 'the chain name' })
    chain: string = "";

    @ApiProperty()
    @Column({ comment: 'the websocket endpoint' })
    wssEndpoint: string = "";

    @ApiProperty()
    @Column({ comment: 'the symbol name' })
    symbol: string = "";


    @ApiProperty()
    @Column({ comment: 'the start roundIndex when monitor begin with', type: 'bigint' })
    startRoundIndex: number = 0;

    @ApiProperty()
    @Column({ comment: 'the start timestamp when monitor begin with', default: '2021-01-01T12:29:33.421' })
    startTimestamp: string = '2021-01-01T12:29:33.421';

    @ApiProperty()
    @Column({
        type: 'int',
        default: 64
    })
    maxCollatorCount: number = 64;

    @ApiProperty()
    @Column({
        type: 'int',
        default: 300
    })
    maxNominatorCount: number = 300;
}