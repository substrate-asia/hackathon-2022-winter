import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['subscribe_address'])
export class MonitorSubscribe {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ comment: 'address who subcribe the target address', nullable: false, })
    subscribe_address: string;

    @ApiProperty()
    @Column({
        comment: 'email to receive the notification',
        nullable: false,
    })
    subscribe_email: string;

    @ApiProperty()
    @Column({
        comment: 'all watched collator , split with comma',
        nullable: false,
        type: 'text',
    })
    watched_address: string;


    @ApiProperty()
    @Column({ comment: 'auto notify for my stake, the stake account is as same as the subscribe address. 1=true ,0=false;', nullable: false, default: 1 })
    auto_notify_at_my_stake: number;

    @ApiProperty()
    @Column({
        comment: 'md5 hash for last notify message',
        nullable: false,
    })
    last_notify_messsage_hash: string;

    @ApiProperty()
    @Column({ comment: 'last notify time', nullable: false })
    last_notify_time: Date;

}