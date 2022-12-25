import { ApiProperty } from '@nestjs/swagger';

export class MonitorSubscribeRequest {

    @ApiProperty({ description: "current user's wallet address as subscribe address" })
    subscribe_address: string;
}
