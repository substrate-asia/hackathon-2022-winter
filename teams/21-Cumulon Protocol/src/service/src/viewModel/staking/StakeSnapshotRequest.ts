import { ApiProperty } from "@nestjs/swagger";
import { StakingRequest } from "./StakingRequest";

export class StakeSnapshotRequest extends StakingRequest {
  @ApiProperty({ description: "start roundIndex" })
  startRoundIndex: number;

  @ApiProperty({ description: "end roundIndex" })
  endRoundIndex: number;

  @ApiProperty({ description: "collator account;" })
  collatorAccount: string;
}
