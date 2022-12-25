import { ApiProperty } from "@nestjs/swagger";
import { StakingPageRequest } from "../StakingRequest";

export class StatCollatorPageRequest extends StakingPageRequest {
  @ApiProperty({
    description:
      "if specified it to the true, data will return the total for pagination",
  })
  needTotal = false;

  @ApiProperty({
    required: false,
    description: 'matched by LIKE %collator%'
  })
  collator: string;

  @ApiProperty({
    required: false,
    description: 'matched by LIKE %delegator%'
  })
  delegator: string;
}
