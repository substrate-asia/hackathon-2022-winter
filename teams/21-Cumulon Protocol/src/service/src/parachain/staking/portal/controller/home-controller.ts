import {
  CacheTTL,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HttpCacheInterceptor } from "src/common/interceptor/HttpCacheInterceptor";
import {
  StakingPageRequest,
  StakingRequest,
} from "src/viewModel/staking/StakingRequest";
import { ServiceManager } from "../../core/service/service-manager";
import { MyStakeRequest } from "../model/MyStakeRequest";
import { MyStake } from "../model/MyStakeResponse";
import { HomeService } from "../service/home-service";

import { parachainNetworks } from "../../core/register/chain-network-register";
import { StatNetwork } from "src/common/entity/StakingModule/StatNetwork.entity";
import { StatNetworkRequest } from "src/viewModel/staking/portal/StatNetworkRequest";

@UseInterceptors(HttpCacheInterceptor)
@ApiTags("staking-portal/home")
@Controller("parachain/staking/home")
export class StakingHomeController {
  constructor(private serviceManager: ServiceManager) {}

  proxyService(req: StakingRequest | StakingPageRequest) {
    const matched = this.serviceManager.getService<HomeService>(
      req.chainId,
      "HomeService"
    );
    if (!matched) {
      throw new Error("not supported chain network");
    }
    return matched;
  }

  @Get("myStake")
  listMyStake(@Query() request: MyStakeRequest): Promise<MyStake[]> {
    return this.proxyService(request).listMyStake(request);
  }


  @Get("network/statistics")
  // @CacheTTL(60)
  @ApiOperation({
    summary:
      "list network statistics, if no chainId presented it will returned all supported"
  })
  async listNetworkStat(@Query() request: StatNetworkRequest): Promise<StatNetwork[]> {
    const res = [];
    if (request && request.chainId) {
      const chainId = request.chainId;
      res.push(await this.proxyService({ chainId }).listNetworkStat(chainId));
    } else {
      for (const network of parachainNetworks) {
        const chainId = network.info.id;
        res.push(await this.proxyService({ chainId }).listNetworkStat(chainId));
      }
    }
    return res;
  }
}
