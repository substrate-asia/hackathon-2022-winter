import { ApiProperty } from '@nestjs/swagger';
import { StakingPageRequest } from './StakingRequest';

export class CollatorActionHistoryRequest extends StakingPageRequest {

    @ApiProperty({ description: "collator account" })
    collatorAccount: string;
}
