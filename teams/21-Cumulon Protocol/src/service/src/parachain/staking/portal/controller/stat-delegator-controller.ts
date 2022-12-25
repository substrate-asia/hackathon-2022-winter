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
import { StatDelegatorPageRequest } from "src/viewModel/staking/portal/StatDelegatorPageRequest";
import { StatCollatorStatService } from "../service/stat-collator-service";
import { StatDelegatorService } from "../service/stat-delegator-service";

@UseInterceptors(HttpCacheInterceptor)
@ApiTags("staking-portal/delegator")
@Controller("parachain/staking/delegator")
export class StatDelegatorController {
  constructor(private delegatorService: StatDelegatorService) {}

  @Post("statistics")
  @CacheTTL(60)
  async listNetworkStat(
    @Body() request: StatDelegatorPageRequest
  ): Promise<any> {
    const data = await this.delegatorService.list(request);
    return {
      list: request.needTotal ? data[0] : data,
      totalCount: request.needTotal ? data[1] : undefined,
    };
  }

  //
}
