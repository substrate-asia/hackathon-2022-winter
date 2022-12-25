import { ApiProperty } from "@nestjs/swagger";
import { StakingPageRequest } from "../StakingRequest";

export class StatDelegatorPageRequest extends StakingPageRequest {
  @ApiProperty()
  collator: string;

  @ApiProperty({
    description: 'if specified it to the true, data will return the total for pagination'
  })
  needTotal = false

}
