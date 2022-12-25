import { ApiProperty } from "@nestjs/swagger";
import { StakingRequest } from "src/viewModel/staking/StakingRequest";
export class MyStakeRequest extends StakingRequest {

    @ApiProperty({description: 'accountId account address'})
    accountId: string;

}