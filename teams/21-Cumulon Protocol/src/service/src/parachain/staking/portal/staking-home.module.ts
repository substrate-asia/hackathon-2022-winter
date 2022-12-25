import { CacheModule, HttpModule, Module } from "@nestjs/common";
import { StatCollatorController } from "./controller/stat-collator-controller";
import { StakingHomeController } from "./controller/home-controller";
import { StatCollatorStatService } from "./service/stat-collator-service";
import { HomeService } from "./service/home-service";
import { MyStakeListService } from "./service/my-stake-list-service";
import { StatDelegatorService } from "./service/stat-delegator-service";
import { StatDelegatorController } from "./controller/stat-delegator-controller";


@Module({
    imports: [CacheModule.register({
        ttl: 15,  
      }), HttpModule],
  controllers: [StakingHomeController, StatCollatorController, StatDelegatorController],
  providers: [MyStakeListService, HomeService, StatCollatorStatService, StatDelegatorService],
  exports: [MyStakeListService, HomeService, StatCollatorStatService, StatDelegatorService],
})
export class StakingHome2Module {}
