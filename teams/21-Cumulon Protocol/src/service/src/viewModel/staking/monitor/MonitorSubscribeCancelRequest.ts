import { ApiProperty } from '@nestjs/swagger';

export class MonitorSubscribeCancelRequest {

    @ApiProperty({ description: "current user's wallet address as subscribe address" })
    subscribe_address: string;

    @ApiProperty({ description: "remove these address from subscribe address" })
    cancel_watched_address: string[];

    @ApiProperty({ description: 'auto notify for my stake, the stake account is as same as the subscribe address. 1=true ,0=false;', default: 1 })
    auto_notify_at_my_stake: number;
}
