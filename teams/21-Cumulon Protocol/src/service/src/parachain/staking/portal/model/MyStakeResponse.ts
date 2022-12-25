import { ApiProperty } from "@nestjs/swagger";
export class MyStake {

    chainId: string;

    // @ApiProperty({description: 'nnetwork name'})
    // network: string;

    collator: string;

    stakedAmount: string;

}