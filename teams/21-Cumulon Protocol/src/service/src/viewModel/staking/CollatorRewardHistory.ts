import { ApiProperty } from '@nestjs/swagger';
import { RewardHistory } from 'src/common/entity/StakingModule/RewardHistory.entity';
import { PageResponse } from '../base/pageResponse';
import { StakingPageRequest } from './StakingRequest';

export class CollatorRewardHistoryRequest extends StakingPageRequest {

    @ApiProperty({ description: "collator account" })
    collatorAccount: string;
}
export class CollatorRewardHistoryResponse extends PageResponse {

    @ApiProperty()
    list: RewardHistory[];
}
