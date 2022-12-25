import { ApiProperty } from "@nestjs/swagger";
import { StakingRequest } from "./StakingRequest";

export class CollatorRewardStatisticRequest extends StakingRequest {
    @ApiProperty()
    collatorAccount: string;
}

export class CollatorRewardStatisticResponse {
    @ApiProperty()
    collatorAccount: string;
    @ApiProperty()
    latestReward: number;
    @ApiProperty()
    totalReward: number;
}