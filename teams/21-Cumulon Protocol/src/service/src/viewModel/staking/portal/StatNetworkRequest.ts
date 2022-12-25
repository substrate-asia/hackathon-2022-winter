import { ApiProperty } from "@nestjs/swagger";

export class StatNetworkRequest {

    @ApiProperty({ description: "if no chainId presented, returned all supported network's statistics data", required: false })
    chainId: string; // ParachainNetwork.info.id
  }
