import { HttpService, Injectable } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { ChainConnector } from "src/common/chain/chain-connector";
import { StakingBaseService } from "../../base/service/staking-base-service";
import { DbManager } from "../../core/db/db-manager";

@Injectable()
export class CollatorService {
  constructor(private readonly httpService: HttpService) {}

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

  async getStatCollatorsHisBy({ chainId, collator }) {
    let records = await DbManager.get(chainId).statDelegatorRepository.find({
      where: { collator },
    });
    const dataMap = {};
    records.forEach((it: any) => {
      dataMap[it.delegator] = it;
    });
    return dataMap;
  }
 
  async statDelegatorsReward({
    chainId,
    collator,
    delegators,
    startTime,
    endTime
  }) {

    const getTsString = (date) => {
      return !date
      ? null
      : date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0") +
        " " +
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0") +
        ":" +
        String(date.getSeconds()).padStart(2, "0");
    }
    const startTs = getTsString(startTime);
    const endTs = getTsString(endTime || new Date());

    let query = `SELECT
    account,
    collator,
    sum( balance ) AS reward,
    max(realroundindex) AS latest_reward_block
  FROM
    nominator_reward_detail_histories 
  WHERE
  collator = '${collator}' 
  AND account IN ( '${delegators.toString().replace(/,/g, "','")}' )  
  ${startTs ? " AND timestamp >= '" + startTs + "'" : ""} 
  AND timestamp < '${endTs}' 
  GROUP BY collator, account
  ORDER BY collator, account`;

    let rawData = await DbManager.get(chainId).rhRepository.query(query);
    const result = [];
    if (rawData && rawData.length > 0) {
      for (const row of rawData) {
        result.push({
          collator: row.collator,
          delegator: row.account,
          reward: (row.reward - 0) || 0,
          latestRewardBlock: row.latest_reward_block - 0,
        });
      }
      for (const row of result) {
        const data = await DbManager.get(chainId).rhRepository.query(
          `SELECT balance AS reward FROM nominator_reward_detail_histories 
          WHERE collator = '${collator}' AND account = '${row.delegator}' AND realroundindex=${row.latestRewardBlock} 
          ORDER BY timestamp DESC LIMIT 1 `
        );
        row.latestReward = data[0].reward;
      }
    }

    return result;
  }

  // private getStakeRank(row, collator) {
  //   const findIndex = row.allNominators.findIndex(
  //     (v) => v.pk === collator || v.owner === collator
  //   );
  //   return findIndex + 1;
  // }

  // async fillReward(baseService: StakingBaseService, shareData) {
  //   const mapUser2Row = shareData.collatorDataMap;
  //   const rs = await baseService.getCollatorTotalReward({
  //     chainId: shareData.chainId,
  //     collators: shareData.collators,
  //   });
  //   if (rs && rs.collators && rs.collators.length)
  //     for (let i = 0; i < rs.collators.length; i++) {
  //       const v = rs.collators[i];
  //       mapUser2Row[v.account].totalReward = v.reward;
  //       mapUser2Row[v.account].latestReward =
  //         await this.getCollatorLatestReward({
  //           collator: v.account,
  //           chainId: shareData.chainId,
  //         });
  //     }
  // }

  async batchCalApr(
    baseService: StakingBaseService,
    cc: ChainConnector,
    shareData
  ) {
    const round = shareData.round;
    const accounts = shareData.collators;
    const mapUser2Row = shareData.collatorDataMap;
    const blockPerRound = round.length;
    const realtimeCollatorState = shareData.realtimeCollatorState;

    if (
      cc.network.network === "moonbeam" ||
      cc.network.network === "moonriver"
    ) {
      let total_supply = Number(round.totalIssuance);

      for (let i = 0; i < realtimeCollatorState.length; i++) {
        let stake = cc
          .formatWithDecimals(realtimeCollatorState[i].totalCounted)
          .toNumber();
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
        baseService,
        accounts,
        realtimeCollatorState,
        shareData
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
        let stake = cc
          .formatWithDecimals(realtimeCollatorState[i].totalCounted)
          .toNumber();
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
    baseService: StakingBaseService,
    accounts,
    realtimeCollatorState,
    shareData
  ) {
    const startRoundIndex = this.getStartRoundIndex(shareData.round);
    const endRoundIndex = this.getEndRoundIndex(shareData.round);

    const { collatorReward } = shareData;

    realtimeCollatorState.forEach((v) => {
      const arr = [];
      for (let i = startRoundIndex; i <= endRoundIndex; i++) {
        const find = collatorReward.find(
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
      chainId: shareData.chainId,
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

  async batchCalAvgBlock(
    baseService: StakingBaseService,
    cc: ChainConnector,
    shareData
  ) {
    const { chainId, round, collators, collatorDataMap } = shareData;
    const endRoundIndex = round.current - 1;

    const blocks = (
      await baseService.getCollatorProducedBlocks({
        chainId,
        startRoundIndex: round.current - 11,
        endRoundIndex,
        accounts: collators,
      })
    ).blocks;

    collators.forEach((collator) => {
      for (const roundSize of [1, 3, 4, 5, 8, 10]) {
        let totalBlocks = 0;
        let activeRound = 0;

        blocks &&
          blocks
            .filter(
              (bi) =>
                bi.account === collator &&
                Number(bi.roundIndex) >= round.current - 1 - roundSize &&
                Number(bi.roundIndex) <= endRoundIndex
            )
            .forEach((bi) => {
              activeRound++;
              totalBlocks += Number(bi.blocks_count);
            });
        collatorDataMap[collator][`avgBlockIn${roundSize}R`] =
          activeRound > 0 ? Number(totalBlocks / activeRound) : 0;
      }
    });
  }
}
