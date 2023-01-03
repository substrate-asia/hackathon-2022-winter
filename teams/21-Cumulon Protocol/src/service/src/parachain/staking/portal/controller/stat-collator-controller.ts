import {
  Body,
  CacheTTL,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HttpCacheInterceptor } from "src/common/interceptor/HttpCacheInterceptor";
import { StatCollatorPageRequest } from "src/viewModel/staking/portal/StatCollatorPageRequest";
import { StatDelegatorPageRequest } from "src/viewModel/staking/portal/StatDelegatorPageRequest";
import { StakingRequest } from "src/viewModel/staking/StakingRequest";
import { StatCollatorStatService } from "../service/stat-collator-service";
import { StatDelegatorService } from "../service/stat-delegator-service";

@UseInterceptors(HttpCacheInterceptor)
@ApiTags("staking-portal/collator")
@Controller("parachain/staking/collator")
export class StatCollatorController {
  constructor(
    private collatorService: StatCollatorStatService,
    private delegatorService: StatDelegatorService
  ) {}

  @Get("getSafeStateConfig")
  @CacheTTL(60)
  async getSafeStateConfig(@Query() request: StakingRequest): Promise<any> {
    return this.collatorService.getSafeStateConfig(request);
  }

  @Post("statistics")
  @CacheTTL(60)
  async listNetworkStat(
    @Body() request: StatCollatorPageRequest
  ): Promise<any> {
    const data = await this.collatorService.list(request);
    return {
      list: request.needTotal ? data[0] : data,
      totalCount: request.needTotal ? data[1] : undefined,
    };
  }

  //
}
