import {
  Body,
  CacheTTL,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HttpCacheInterceptor } from "src/common/interceptor/HttpCacheInterceptor";
import { CollatorActionHistoryRequest } from "src/viewModel/staking/CollatorActionHistoryRequest";
import { CollatorActionHistoryResponse } from "src/viewModel/staking/CollatorActionHistoryResponse";
import { CollatorProducedBlocksRequest } from "src/viewModel/staking/CollatorProducedBlocksRequest";
import {
  CollatorRewardHistoryRequest,
  CollatorRewardHistoryResponse,
} from "src/viewModel/staking/CollatorRewardHistory";
import { CollatorRewardRequest } from "src/viewModel/staking/CollatorRewardRequest";
import {
  CollatorRewardStatisticRequest,
  CollatorRewardStatisticResponse,
} from "src/viewModel/staking/CollatorRewardStatistic";
import { CollatorsRequest } from "src/viewModel/staking/CollatorsRequest";
import {
  DelegatorActionHistoryRequest,
  DelegatorActionHistoryResponse,
} from "src/viewModel/staking/DelegatorActionHistory";
import {
  DelegatorRewardHistoryRequest,
  DelegatorRewardHistoryResponse,
} from "src/viewModel/staking/DelegatorRewardHistory";
import {
  DelegatorRewardStatisticRequest,
  DelegatorRewardStatisticResponse,
} from "src/viewModel/staking/DelegatorRewardStatistic";
import { NominatorRewardRequest } from "src/viewModel/staking/NominatorRewardRequest";
import { StakeSnapshotRequest } from "src/viewModel/staking/StakeSnapshotRequest";
import {
  StakingPageRequest,
  StakingRequest,
} from "src/viewModel/staking/StakingRequest";

import { StakingBaseService } from "../service/staking-base-service";
import { ServiceManager } from "../../core/service/service-manager";

// import { StakingAnalysisService } from './staking-analysis.service';

@UseInterceptors(HttpCacheInterceptor)
@ApiTags("staking-analysis")
@Controller("parachain/staking")
export class StakingBaseController {
  constructor(private serviceManager: ServiceManager) {}

  proxyService(req: StakingRequest | StakingPageRequest) {
    const id = req.chainId;
    const matched = this.serviceManager.getService<StakingBaseService>(
      id,
      'StakingBaseService'
    );
    if (!matched) {
      throw new Error("not supported chain network");
    }
    return matched;
  }

  @Get("/getLatestBlockNumber")
  @ApiOperation({ summary: "get latest block number;获取当前区块高度" })
  @ApiOkResponse()
  getLatestBlockNumber(@Query() request: StakingRequest): Promise<number> {
    return this.proxyService(request).getLatestBlockNumber(request.chainId);
  }

  @Get("/getCurrentRoundInfo")
  @ApiOperation({
    summary:
      "get current round info;获取当前round的信息， 包含roundIndex, 起始区块高度， 区块长度",
  })
  @ApiOkResponse()
  getCurrentRoundInfo(@Query() request: StakingRequest): Promise<number> {
    return this.proxyService(request).getCurrentRoundInfo(request.chainId);
  }

  @Get("/getMaxNominatorsPerCollator")
  @ApiOperation({
    summary:
      "get max nominators count for each collator;获取每个Collator节点最多的nominator数量",
  })
  @ApiOkResponse()
  getMaxNominatorsPerCollator(
    @Query() request: StakingRequest
  ): Promise<number> {
    return this.proxyService(request).getMaxNominatorsPerCollator(
      request.chainId
    );
  }

  @Get("/getRealtimeCollatorCandidatePool")
  @ApiOperation({
    summary:
      "get all collator candidates in realtime;获取实时的collator的候选列表，包含了所有的collator节点，可以根据这个列表数据来实时判断 collator节点的排位",
  })
  @ApiOkResponse()
  getRealtimeCollatorCandidatePool(
    @Query() request: StakingRequest
  ): Promise<number> {
    return this.proxyService(request).getRealtimeCollatorCandidatePool(
      request.chainId
    );
  }

  @Get("/getSelectedCollators4CurrentRound")
  @ApiOperation({
    summary:
      "get selected collators when the round start;获取在当前round开始运行前，已经选中的若干个collator节点列表",
  })
  @ApiOkResponse()
  getSelectedCollators4CurrentRound(
    @Query() request: StakingRequest
  ): Promise<number> {
    return this.proxyService(request).getSelectedCollators4CurrentRound(
      request.chainId
    );
  }

  @Post("/getRealtimeCollatorState")
  @ApiOperation({
    summary:
      "get all states include collators and nominators in realtime;获取实时的collator和nominator关联的列表，可以根据这个列表数据来实时判断 如果参加当前collator节点后， nominator的排位",
  })
  @ApiOkResponse()
  getRealtimeCollatorState(@Body() request: CollatorsRequest): Promise<number> {
    let collatorAccounts = request.collators;
    return this.proxyService(request).getRealtimeCollatorState(
      request.chainId,
      collatorAccounts
    );
  }

  // @Get('/getScheduledExitQueue')
  // @ApiOperation({ summary: 'get the scheduled exit of collators/nominators;获取这是计划要离开的collator节点和nominator，离开不是立刻生效的， 需要等待指定的roundIndex，可以根据该列表在预测下一个round的排位时， 注意检查如果roundIndex匹配， 需要排除掉对应的数据。' })
  // @ApiOkResponse()
  // getScheduledExitQueue(@Body() request): Promise<number> {
  //   return this.proxyService(request).getScheduledExitQueue();
  // }

  @CacheTTL(60)
  @Get("/getMaxCollatorsPerRound")
  @ApiOperation({
    summary:
      "get max collators count per round;获取每个round最多的collator数量",
  })
  @ApiOkResponse()
  getMaxCollatorsPerRound(@Query() request: StakingRequest): Promise<number> {
    return this.proxyService(request).getMaxCollatorsPerRound(request.chainId);
  }

  @CacheTTL(60)
  @Post("/getNominatorReward")
  @ApiOperation({
    summary:
      "//get reward statistic for a range of round index;获取指定范围的roundIndex的reward统计信息, 注意:目前nominator的reward已经支持按照collator分开",
  })
  @ApiOkResponse()
  getNominatorReward(@Body() request: NominatorRewardRequest): Promise<any> {
    return this.proxyService(request).getNominatorReward(request);
  }

  @CacheTTL(60)
  @Post("/getDelegatorRewardStatistic")
  @ApiOperation({
    summary:
      "//get reward statistic of delegator;获取delegator的reward统计信息",
  })
  @ApiOkResponse({ type: DelegatorRewardStatisticResponse })
  getDelegatorRewardStatistic(
    @Body() request: DelegatorRewardStatisticRequest
  ): Promise<DelegatorRewardStatisticResponse> {
    return this.proxyService(request).getDelegatorRewardStatistic(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorRewardStatistic")
  @ApiOperation({
    summary: "//get reward statistic of Collator;获取Collator的reward统计信息",
  })
  @ApiOkResponse({ type: CollatorRewardStatisticResponse })
  getCollatorRewardStatistic(
    @Body() request: CollatorRewardStatisticRequest
  ): Promise<CollatorRewardStatisticResponse> {
    return this.proxyService(request).getCollatorRewardStatistic(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorReward")
  @ApiOperation({
    summary:
      "//get reward statistic for a range of round index;获取指定范围的roundIndex的reward统计信息",
  })
  @ApiOkResponse()
  getHistoryReward(@Body() request: CollatorRewardRequest): Promise<any> {
    return this.proxyService(request).getCollatorReward(request);
  }
  @CacheTTL(60)
  @Post("/getCollatorProducedBlocks")
  @ApiOperation({
    summary:
      "//get produced blocks count for a range of round index;获取指定范围的roundIndex的生产的Blocks数量信息",
  })
  @ApiOkResponse()
  getCollatorProducedBlocks(
    @Body() request: CollatorProducedBlocksRequest
  ): Promise<any> {
    return this.proxyService(request).getCollatorProducedBlocks(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorTotalReward")
  @ApiOperation({
    summary:
      "//get total reward statistic of the specified collators;获取collator所有的reward总和",
  })
  @ApiOkResponse()
  getCollatorTotalReward(@Body() request: CollatorsRequest): Promise<any> {
    return this.proxyService(request).getCollatorTotalReward(request);
  }

  @CacheTTL(60)
  @Post("/atStake")
  @ApiOperation({
    summary:
      "//get the stake summary info for the specified roundIndex, include collator stake, nominator stake;获取指定roundIndex的stake统计信息（collator stake, nominator stake）",
  })
  @ApiOkResponse()
  getStake(@Body() request: StakeSnapshotRequest): Promise<any> {
    return this.proxyService(request).atStake(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorActionHistory")
  @ApiOperation({
    summary:
      "//get all action history of the specified collator;获取collator的历史事件记录",
  })
  @ApiOkResponse({ type: CollatorActionHistoryResponse })
  getCollatorActionHistory(
    @Body() request: CollatorActionHistoryRequest
  ): Promise<CollatorActionHistoryResponse> {
    return this.proxyService(request).getCollatorActionHistory(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorRewardHistory")
  @ApiOperation({
    summary:
      "//get all reward history of the specified collator;获取collator的历史Reward记录",
  })
  @ApiOkResponse({ type: CollatorRewardHistoryResponse })
  getCollatorRewardHistory(
    @Body() request: CollatorRewardHistoryRequest
  ): Promise<CollatorRewardHistoryResponse> {
    return this.proxyService(request).getCollatorRewardHistory(request);
  }

  @CacheTTL(60)
  @Post("/getDelegatorActionHistory")
  @ApiOperation({
    summary:
      "//get all action history of the specified delagator;获取Delegator的历史事件记录",
  })
  @ApiOkResponse({ type: DelegatorActionHistoryResponse })
  getDelegatorActionHistory(
    @Body() request: DelegatorActionHistoryRequest
  ): Promise<DelegatorActionHistoryResponse> {
    return this.proxyService(request).getDelegatorActionHistory(request);
  }

  @CacheTTL(60)
  @Post("/getDelegatorRewardHistory")
  @ApiOperation({
    summary:
      "//get all reward detail history of the specified collator;获取Delegator的历史Reward记录",
  })
  @ApiOkResponse({ type: DelegatorRewardHistoryResponse })
  getDelegatorRewardHistory(
    @Body() request: DelegatorRewardHistoryRequest
  ): Promise<DelegatorRewardHistoryResponse> {
    return this.proxyService(request).getDelegatorRewardHistory(request);
  }
}
