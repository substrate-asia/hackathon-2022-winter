import { ApiProperty } from '@nestjs/swagger';
import { StakingRequest } from './StakingRequest';

export class CollatorProducedBlocksRequest extends StakingRequest {

    @ApiProperty({ description: "start roundIndex" })
    startRoundIndex: number;

    @ApiProperty({ description: "end roundIndex" })
    endRoundIndex: number;

    @ApiProperty({ description: "filter by accounts; if accounts is empty the data will be grouped by account; collator账户过滤, 如果为空, 则返回数据会根据所有collator账户聚合" })
    accounts?: string[];
}
