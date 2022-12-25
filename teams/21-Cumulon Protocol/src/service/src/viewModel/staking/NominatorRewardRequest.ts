import { ApiProperty } from "@nestjs/swagger";
import { StakingRequest } from "./StakingRequest";

export class NominatorRewardRequest extends StakingRequest {
  @ApiProperty({ description: "start roundIndex" })
  startRoundIndex: number;

  @ApiProperty({ description: "end roundIndex" })
  endRoundIndex: number;

  @ApiProperty({
    description:
      "filter by account; if account is empty, will return all data ; 用于指定的nominator, 如果为空,则返回所有nominator的数据;如果不为空,则返回指定nominator的reward",
  })
  account?: string;

  @ApiProperty({
    description:
      "collator account;用于指定的collator, 如果为空,则返回所有reward;如果不为空,则返回指定collator的reward",
  })
  collatorAccount?: string;
}
