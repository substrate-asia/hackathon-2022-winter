import { ApiProperty } from "@nestjs/swagger";
import { StakingRequest } from "./StakingRequest";

export class CollatorsRequest extends StakingRequest {
  @ApiProperty({ description: "collator account list" })
  collators: string[];
}
