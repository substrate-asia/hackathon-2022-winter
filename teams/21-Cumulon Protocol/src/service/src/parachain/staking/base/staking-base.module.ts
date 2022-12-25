import { CacheModule, Module } from "@nestjs/common";

import { StakingBaseController } from "./controller/staking-base-controller";
import { BifrostStakingBaseService } from "./service/bifrost-staking-base-service";
import { StakingBaseService } from "./service/staking-base-service";

@Module({
    imports: [CacheModule.register({
        ttl: 15,  
      }),],
  controllers: [StakingBaseController],
  providers: [StakingBaseService, BifrostStakingBaseService],
  exports: [StakingBaseService, BifrostStakingBaseService],
})
export class StakingBase2Module {}
