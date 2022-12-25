import { Injectable } from "@nestjs/common";
import { StakingBaseService } from "./staking-base-service";


/**
 * this service is intended for the demonstration
 */
@Injectable()
export class BifrostStakingBaseService extends StakingBaseService {

    getCurrentRoundInfo(chainId): Promise<any> {
        this.logger.debug('BifrostStakingService.getCurrentRoundInfo() is invoked..........');
        return super.getCurrentRoundInfo(chainId);
    }
}