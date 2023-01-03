import { HttpService, Injectable } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { request } from "express";
import { map } from "rxjs/operators";
import { ChainConnector } from "src/common/chain/chain-connector";
import { StakingRequest } from "src/viewModel/staking/StakingRequest";
import { StakingBaseService } from "../../base/service/staking-base-service";
import { ChainConnectManager } from "../../core/chain/chain-connect-manager";
import { DbManager } from "../../core/db/db-manager";
import { ServiceManager } from "../../core/service/service-manager";
import { MyStakeRequest } from "../model/MyStakeRequest";
import { MyStake } from "../model/MyStakeResponse";
// import { lastValueFrom } from 'rxjs';

@Injectable()
export class MyStakeListService {
  constructor(
    readonly httpService: HttpService,
    readonly serviceManager: ServiceManager
  ) {}

  async getCollatorLatestReward({ collator, chainId }): Promise<any> {
    let result: any = {};
    result.collators = [];
    result.totalCount = 0;
    let query = `SELECT balance  AS latestReward  FROM collator_reward_histories where 
    account = '${collator}' order by realroundindex desc limit 1`;

    let rawData = await DbManager.get(chainId).rhRepository.query(query);
    if (rawData && rawData.length > 0) {
      return rawData[0].latestreward;
    }
    return 0;
  }

  async listMyStake(request: MyStakeRequest): Promise<Array<MyStake>> {
    const cc = ChainConnectManager.get(request);

    const chainData = await cc.api.query.parachainStaking.delegatorState(
      request.accountId
    );
    if (!chainData || chainData.isEmpty) {
      return [];
    }
    // const maxTopDelegationsPerCandidate =
    //   cc.api.consts.parachainStaking.maxTopDelegationsPerCandidate;
    const mapUser2Row = {};
    const data = (chainData.toJSON() as any).delegations.map((it) => {
      let stakedAmount = cc.formatWithDecimals(it.amount.toString()).toNumber();
      return (mapUser2Row[it.owner] = {
        chainId: request.chainId,
        collator: it.owner,
        stakedAmount,
        totalReward: 0,
        latestReward: 0,
        rank: 0,
      });
    });

    const baseService: StakingBaseService = this.serviceManager.getService(
      request,
      StakingBaseService.name
    );

    const collators = data.map((it) => it.collator);


    // TODO TO OPTIMIZE THE RANK BY STAT-TASK
    const realtimeCollatorState = await cc.getRealtimeCollatorState(collators);
    realtimeCollatorState &&
      realtimeCollatorState.forEach((v) => {
        v.allNominators = [...v.topDelegations, ...v.bottomDelegations];
        mapUser2Row[v.id].rank = this.getStakeRank(v, request.accountId);
      });

    // becuase the data would be very small, get all directly
    const stats = await DbManager.get(request).statCollatorRepository.find({});
    for (const it of stats) {
      if (collators.indexOf(it.collator) < 0) continue;
      const row = mapUser2Row[it.collator];
      row.apr = it.apr;
      row.totalReward = it.totalReward;
      row.latestReward = await this.getCollatorLatestReward({
            collator: it.collator,
            chainId: request.chainId,
          });

    }

    // await this.fillReward(request, baseService, collators, mapUser2Row);

    // await this.fillApr(
    //   request,
    //   baseService,
    //   collators,
    //   cc,
    //   mapUser2Row,
    //   realtimeCollatorState,
    //   divider
    // );
    return data;
  }

  private getStakeRank(row, collator) {
    const findIndex = row.allNominators.findIndex(
      (v) => v.pk === collator || v.owner === collator
    );
    return findIndex + 1;
  }

  async fillReward(
    request: MyStakeRequest,
    baseService: StakingBaseService,
    collators,
    mapUser2Row
  ) {
    const rs = await baseService.getCollatorTotalReward({
      chainId: request.chainId,
      collators,
    });
    if (rs && rs.collators && rs.collators.length)
      for (let i = 0; i < rs.collators.length; i++) {
        const v = rs.collators[i];
        mapUser2Row[v.account].totalReward = v.reward;
        mapUser2Row[v.account].latestReward =
          await this.getCollatorLatestReward({
            collator: v.account,
            chainId: request.chainId,
          });
      }
  }

  async fillApr(
    request: MyStakeRequest,
    baseService: StakingBaseService,
    accounts,
    cc: ChainConnector,
    mapUser2Row,
    realtimeCollatorState,
    divider
  ) {
    const round = (await cc.api.query.parachainStaking.round()).toJSON() as {
      current;
      first;
      length;
      totalIssuance;
    };
    const blockPerRound = round.length;

    if (
      cc.network.network === "moonbeam" ||
      cc.network.network === "moonriver"
    ) {
      let total_supply = Number(round.totalIssuance);

      for (let i = 0; i < realtimeCollatorState.length; i++) {
        let stake = this.formatWithDecimals(
          realtimeCollatorState[i].totalCounted,
          divider
        ).toNumber();
        let collator_counted_stake = Number(stake);
        let avg_blocks_per_round = stake;
        console.log(
          "total_supply:",
          total_supply,
          " collator_counted_stake:",
          collator_counted_stake,
          " avg_blocks_per_round:",
          avg_blocks_per_round
        );

        mapUser2Row[realtimeCollatorState[i].id].apr =
          ((0.00001388888888888889 * total_supply * avg_blocks_per_round) /
            collator_counted_stake) *
          100;
      }
    } else {
      const blockTargetSeconds = await this.getBlockTargetSeconds(
        cc.network.network
      );

      await this.initRewards(
        request,
        baseService,
        accounts,
        realtimeCollatorState,
        round
      );
      for (let i = 0; i < realtimeCollatorState.length; i++) {
        const rewardInRounds = this.getRewardInRounds(
          realtimeCollatorState[i],
          10
        );
        // const filterNoRewardRoundWhenCalcAPR = false;
        const rounds =
          //   filterNoRewardRoundWhenCalcAPR === true
          //     ? rewardInRounds.roundsHasReward :
          rewardInRounds.rounds;

        let roundPerYear = await this.getRoundPerYear(
          blockTargetSeconds,
          blockPerRound
        );
        let stake = this.formatWithDecimals(
          realtimeCollatorState[i].totalCounted,
          divider
        ).toNumber();
        let reward = rewardInRounds.collatorRewardInRounds;
        //let rounds = params.rounds;
        mapUser2Row[realtimeCollatorState[i].id].apr =
          (reward / (rounds || 1) / (stake || 1)) * roundPerYear * 100;
      }
    }
    // const multiCandidateInfos =
    //   await cc.api.query.parachainStaking.candidateInfo.multi(
    //     data.map((it) => it.collator)
    //   );
    //   // totalCounted

    // return data;
  }
  formatWithDecimals(value, divider) {
    return BigNumber(value).dividedBy(divider);
  }

  getStartRoundIndex(roundInfo) {
    return roundInfo.current - 11 - 0;
  }
  getEndRoundIndex(roundInfo) {
    return roundInfo.current - 2 - 0; //Reward延迟2round发放
  }

  private async initRewards(
    request: MyStakeRequest,
    baseService: StakingBaseService,
    accounts,
    realtimeCollatorState,
    roundInfo
  ) {
    const startRoundIndex = this.getStartRoundIndex(roundInfo);
    const endRoundIndex = this.getEndRoundIndex(roundInfo);
    // 获取Collator的历史10次reward
    const collector10Reward = await baseService.getCollatorReward({
      chainId: request.chainId,
      startRoundIndex: startRoundIndex,
      endRoundIndex: endRoundIndex,
      accounts,
    });

    realtimeCollatorState.forEach((v) => {
      const arr = [];
      for (let i = startRoundIndex; i <= endRoundIndex; i++) {
        const find = collector10Reward.rewards.find(
          (sv) =>
            sv.account.toLowerCase() == v.id.toLowerCase() &&
            Number(sv.roundIndex) == i
        );
        if (find) {
          arr.push({
            roundIndex: i,
            reward: BigNumber(find.reward),
          });
        } else {
          arr.push({
            roundIndex: i,
            reward: BigNumber(0),
          });
        }
      }
      v.historyReward = arr;
    });

    const getNominatorReward = await baseService.getNominatorReward({
      chainId: request.chainId,
      startRoundIndex,
      endRoundIndex,
    });

    // 塞入10次NominatortotalReward (坑点：历史数据返回可能缺失某个roundIndex)
    realtimeCollatorState.forEach((v) => {
      const arr = [];
      for (let i = startRoundIndex; i <= endRoundIndex; i++) {
        //按照collator分开reward数据
        const find = getNominatorReward.rewards.find(
          (sv) =>
            Number(sv.roundIndex) == i &&
            sv.collator.toLowerCase() == v.id.toLowerCase()
        );
        if (find) {
          arr.push({
            roundIndex: i,
            reward: BigNumber(find.reward),
          });
        } else {
          arr.push({
            roundIndex: i,
            reward: BigNumber(0),
          });
        }
      }
      v.historyNominatorTotalReward = arr;
    });
  }

  getRewardInRounds(c, rounds) {
    let roundsHasReward = 0;
    let rewardInRounds = 0;
    let startIndex = c.historyReward.length - rounds;
    if (startIndex < 0) {
      startIndex = 0;
    }
    for (let index = startIndex; index < c.historyReward.length; index++) {
      const element = c.historyReward[index];
      let reward = element.reward.toNumber();
      if (reward > 0) {
        roundsHasReward++;
      }
      rewardInRounds += reward;
    }

    startIndex = c.historyNominatorTotalReward.length - rounds;
    if (startIndex < 0) {
      startIndex = 0;
    }
    for (
      let index = startIndex;
      index < c.historyNominatorTotalReward.length;
      index++
    ) {
      const element = c.historyNominatorTotalReward[index];
      rewardInRounds += element.reward.toNumber();
    }

    return {
      collatorRewardInRounds: rewardInRounds,
      rounds,
      roundsHasReward: roundsHasReward,
    };
  }

  getRoundPerYear(blockTargetSeconds, blockPerRound) {
    let roundPerYear = Math.ceil(
      (365 * 24 * 3600) / (blockTargetSeconds * blockPerRound)
    );
    return roundPerYear;
  }

  async getBlockTargetSeconds(network) {
    let key = "averageBlockTime" + network;
    if (this[key]) {
      return this[key];
    } else {
      if (network === "bifrost") {
        let url = "https://api.bifrost.app/api/dapp/averageBlockTime";

        let response: any = await this.httpService.get(url).toPromise();
        // console.log("getBlockTargetSeconds response:", response);
        if (response) {
          let time = response.data.result.main;
          this[key] = time;
          return time;
        }
      }
    }
    return 12;
  }
}
