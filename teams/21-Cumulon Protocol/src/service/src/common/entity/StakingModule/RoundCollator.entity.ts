import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'round_collators' })
@Index(['roundindex', 'account'])
export class RoundCollator {
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
    @Column({
        comment: 'the stake amount of of current collator',
        type: 'decimal',
        precision: 30,
        scale: 5,
        default: 0
    })
    selfbond: number;

    @ApiProperty()
    @Column({
        comment: 'the total stake amount include collator self and all nominators',
        type: 'decimal',
        precision: 30,
        scale: 5,
        default: 0
    })
    totalbond: number;

    @ApiProperty()
    @Column({ name: 'round_id', comment: '' })
    round_id: string;
}