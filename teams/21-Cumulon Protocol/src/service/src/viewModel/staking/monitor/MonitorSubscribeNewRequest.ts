import { ApiProperty } from '@nestjs/swagger';

export class MonitorSubscribeNewRequest {

    @ApiProperty({ description: "current user's wallet address as subscribe address" })
    subscribe_address: string;

    @ApiProperty({ description: "add these address to subscribe address" })
    new_watched_address: string[];

    @ApiProperty({ description: "email to receive the notification" })
    subscribe_email: string;

    @ApiProperty({ description: 'auto notify for my stake, the stake account is as same as the subscribe address. 1=true ,0=false;', default: 1 })
    auto_notify_at_my_stake: number;
}
