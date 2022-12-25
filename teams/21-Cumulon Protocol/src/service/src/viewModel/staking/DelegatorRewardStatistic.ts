import { ApiProperty } from "@nestjs/swagger";
import { StakingRequest } from "./StakingRequest";

export class DelegatorRewardStatisticRequest extends StakingRequest {
  @ApiProperty()
  delegatorAccount: string;
}

export class DelegatorRewardStatisticResponse {
  @ApiProperty()
  delegatorAccount: string;
  @ApiProperty()
  latestReward: number;
  @ApiProperty()
  totalReward: number;
}
