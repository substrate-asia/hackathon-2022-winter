import { ApiProperty } from "@nestjs/swagger";
import { PageRequest } from "src/viewModel/base/pageRequest";

export class StakingRequest {
  @ApiProperty({ description: "network name" })
  chainId: string; // ParachainNetwork.info.id
}

export class StakingPageRequest extends PageRequest {
  @ApiProperty({ description: "network name" })
  chainId: string; // ParachainNetwork.info.id
}
