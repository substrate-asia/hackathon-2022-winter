import { ApiProperty } from '@nestjs/swagger'; 
import { CollatorActionHistory } from 'src/common/entity/StakingModule/CollatorActionHistory.entity';
import { PageResponse } from '../base/pageResponse';

export class CollatorActionHistoryResponse extends PageResponse {

    @ApiProperty()
    list: CollatorActionHistory[];
}
