import { PageRequest } from "src/viewModel/base/pageRequest";
import { CollatorRewardRequest } from "src/viewModel/staking/CollatorRewardRequest";
import { NominatorRewardRequest } from "src/viewModel/staking/NominatorRewardRequest";

import { StakeSnapshotRequest } from "src/viewModel/staking/StakeSnapshotRequest";
import { CollatorActionHistoryResponse } from "src/viewModel/staking/CollatorActionHistoryResponse";
import {
  CollatorRewardHistoryRequest,
  CollatorRewardHistoryResponse,
} from "src/viewModel/staking/CollatorRewardHistory";
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
import {
  CollatorRewardStatisticRequest,
  CollatorRewardStatisticResponse,
} from "src/viewModel/staking/CollatorRewardStatistic";
import { CollatorProducedBlocksRequest } from "src/viewModel/staking/CollatorProducedBlocksRequest";
import { CollatorActionHistoryRequest } from "src/viewModel/staking/CollatorActionHistoryRequest";

import { CollatorsRequest } from "src/viewModel/staking/CollatorsRequest";
import { ChainConnectManager } from "../../core/chain/chain-connect-manager";
import { DbManager } from "../../core/db/db-manager";
import { W3Logger } from "src/common/log/logger.service";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class StakingBaseService {
  logger: W3Logger;

  constructor() {
    this.logger = new W3Logger(`StakingBaseService`);
  }

  async getDelegatorRewardStatistic(
    request: DelegatorRewardStatisticRequest
  ): Promise<DelegatorRewardStatisticResponse> {
    let resp: DelegatorRewardStatisticResponse =
      new DelegatorRewardStatisticResponse();
    let record = await DbManager.get(request).nrdhRepository.findOne({
      where: {
        account: request.delegatorAccount,
      },
      order: {
        realroundindex: "DESC",
      },
    });
    if (record) {
      let lastRoundIndex = record.realroundindex;
      const { sum } = await DbManager.get(request)
        .nrdhRepository.createQueryBuilder("d")
        .select("SUM(d.balance)", "sum")
        .where("d.account = :account", { account: request.delegatorAccount })
        .andWhere("d.realroundindex = :lastRoundIndex", {
          lastRoundIndex: lastRoundIndex,
        })
        .getRawOne();
      resp.latestReward = Number(sum || 0);
    }

    const { sum } = await DbManager.get(request)
      .nrdhRepository.createQueryBuilder("d")
      .select("SUM(d.balance)", "sum")
      .where("d.account = :account", { account: request.delegatorAccount })
      .getRawOne();
    resp.totalReward = Number(sum || 0);
    return resp;
  }

  async getCollatorRewardStatistic(
    request: CollatorRewardStatisticRequest
  ): Promise<CollatorRewardStatisticResponse> {
    let resp: CollatorRewardStatisticResponse =
      new CollatorRewardStatisticResponse();
    let record = await DbManager.get(request).rhRepository.findOne({
      where: {
        account: request.collatorAccount,
        isCollator: 1,
      },
      order: {
        realroundindex: "DESC",
      },
    });
    if (record) {
      let lastRoundIndex = record.realroundindex;
      const { sum } = await DbManager.get(request)
        .rhRepository.createQueryBuilder("d")
        .select("SUM(d.balance)", "sum")
        .where("d.account = :account", { account: request.collatorAccount })
        .andWhere("d.realroundindex = :lastRoundIndex", {
          lastRoundIndex: lastRoundIndex,
        })
        .getRawOne();
      resp.latestReward = Number(sum || 0);
    }

    const { sum } = await DbManager.get(request)
      .rhRepository.createQueryBuilder("d")
      .select("SUM(d.balance)", "sum")
      .where("d.account = :account", { account: request.collatorAccount })
      .getRawOne();
    resp.totalReward = Number(sum || 0);
    return resp;
  }
  async getDelegatorRewardHistory(
    request: DelegatorRewardHistoryRequest
  ): Promise<DelegatorRewardHistoryResponse> {
    let records = await DbManager.get(request).nrdhRepository.findAndCount({
      where: {
        account: request.delegatorAccount,
      },
      order: {
        timestamp: "DESC",
      },
      skip: PageRequest.getSkip(request),
      take: PageRequest.getTake(request),
    });

    return {
      list: records[0],
      totalCount: records[1],
    };
  }
  async getDelegatorActionHistory(
    request: DelegatorActionHistoryRequest
  ): Promise<DelegatorActionHistoryResponse> {
    let records = await DbManager.get(request).nahRepository.findAndCount({
      where: {
        account: request.delegatorAccount,
      },
      order: {
        timestamp: "DESC",
      },
      skip: PageRequest.getSkip(request),
      take: PageRequest.getTake(request),
    });

    return {
      list: records[0],
      totalCount: records[1],
    };
  }

  async getCollatorRewardHistory(
    request: CollatorRewardHistoryRequest
  ): Promise<CollatorRewardHistoryResponse> {
    let records = await DbManager.get(request).rhRepository.findAndCount({
      where: {
        account: request.collatorAccount,
        isCollator: 1,
      },
      order: {
        timestamp: "DESC",
      },
      skip: PageRequest.getSkip(request),
      take: PageRequest.getTake(request),
    });

    return {
      list: records[0],
      totalCount: records[1],
    };
  }

  async getCollatorActionHistory(
    request: CollatorActionHistoryRequest
  ): Promise<CollatorActionHistoryResponse> {
    let records = await DbManager.get(request).cahRepository.findAndCount({
      where: {
        account: request.collatorAccount,
      },
      order: {
        timestamp: "DESC",
      },
      skip: PageRequest.getSkip(request),
      take: PageRequest.getTake(request),
    });

    return {
      list: records[0],
      totalCount: records[1],
    };
  }
  async getCollatorTotalReward(request: CollatorsRequest): Promise<any> {
    let result: any = {};
    result.collators = [];
    result.totalCount = 0;
    let query = `
            SELECT
                account,
                sum( balance ) AS reward 
              FROM
                collator_reward_histories
              WHERE
                1 = 1 `;
    if (request.collators && request.collators.length > 0) {
      let collators = "";
      for (let index = 0; index < request.collators.length; index++) {
        const c = request.collators[index];
        if (collators.length > 0) {
          collators += ",";
        }
        collators += "'" + c + "'";
      }

      query += `   AND account IN ( ${collators}  )  `;
    }
    query += `  GROUP BY account `;

    let rawData = await DbManager.get(request).rhRepository.query(query);
    if (rawData && rawData.length > 0) {
      for (let index = 0; index < rawData.length; index++) {
        const row = rawData[index];
        result.collators.push({
          account: row.account,
          reward: row.reward,
        });
      }
      result.totalCount = rawData.length;
    }
    return result;
  }
  async getCollatorReward(request: CollatorRewardRequest): Promise<any> {
    let result: any = {};
    result.startRoundIndex = request.startRoundIndex;
    result.endRoundIndex = request.endRoundIndex;
    result.rewards = [];
    result.totalCount = 0;
    //query collator reward
    let query = `
                SELECT
                  realroundindex,
                  account,
                  sum( balance ) AS reward 
                FROM
                  collator_reward_histories 
                WHERE
                  1 = 1 
                  AND realroundindex BETWEEN ${request.startRoundIndex}	AND ${request.endRoundIndex}  `;

    if (request.accounts && request.accounts.length > 0) {
      let accounts = "";
      for (let index = 0; index < request.accounts.length; index++) {
        const c = request.accounts[index];
        if (accounts.length > 0) {
          accounts += ",";
        }
        accounts += "'" + c + "'";
      }

      query += ` AND account IN ( ${accounts}  )  `;
    }

    query += ` GROUP BY  realroundindex, account `;
    query += ` ORDER BY realroundindex, account`;

    let rawData = await DbManager.get(request).rhRepository.query(query);
    if (rawData && rawData.length > 0) {
      for (let index = 0; index < rawData.length; index++) {
        const row = rawData[index];
        result.rewards.push({
          roundIndex: row.realroundindex,
          account: row.account,
          reward: row.reward,
        });
      }
      result.totalCount = rawData.length;
    }
    return result;
  }

  async getCollatorProducedBlocks(
    request: CollatorProducedBlocksRequest
  ): Promise<any> {
    let result: any = {};
    result.startRoundIndex = request.startRoundIndex;
    result.endRoundIndex = request.endRoundIndex;
    result.blocks = [];
    result.totalCount = 0;
    //query collator points as blocks
    let query = `
                SELECT
                  roundindex,
                  account,
                  count( 1 ) AS blocks_count 
                FROM
                  collator_point_histories 
                WHERE
                   roundindex BETWEEN ${request.startRoundIndex}	AND ${request.endRoundIndex}  `;

    if (request.accounts && request.accounts.length > 0) {
      let accounts = "";
      for (let index = 0; index < request.accounts.length; index++) {
        const c = request.accounts[index];
        if (accounts.length > 0) {
          accounts += ",";
        }
        accounts += "'" + c + "'";
      }

      query += ` AND account IN ( ${accounts}  )  `;
    }

    query += ` GROUP BY  roundindex, account `;
    query += ` ORDER BY roundindex, account`;

    let rawData = await DbManager.get(request).cphRepository.query(query);
    if (rawData && rawData.length > 0) {
      for (let index = 0; index < rawData.length; index++) {
        const row = rawData[index];
        result.blocks.push({
          roundIndex: row.roundindex,
          account: row.account,
          blocks_count: row.blocks_count,
        });
      }
      result.totalCount = rawData.length;
    }
    return result;
  }

  async getNominatorReward(request: NominatorRewardRequest): Promise<any> {
    //从 nominator_reward_detail_histories 统计reward到每个collator

    let result: any = {};
    result.startRoundIndex = request.startRoundIndex;
    result.endRoundIndex = request.endRoundIndex;
    result.rewards = [];
    result.totalCount = 0;

    let query = `SELECT
            realroundindex,  
            collator,
            sum( balance ) AS reward 
          FROM
            nominator_reward_detail_histories 
          WHERE
            realroundindex BETWEEN ${request.startRoundIndex} AND ${request.endRoundIndex} `;

    if (request.account) {
      query += ` AND account IN ( '${request.account}' ) `;
    }
    if (request.collatorAccount) {
      query += ` AND collator IN ( '${request.collatorAccount}' ) `;
    }
    query += ` GROUP BY realroundindex, collator 
               ORDER BY realroundindex, collator`;

    let rawData = await DbManager.get(request).rhRepository.query(query);
    if (rawData && rawData.length > 0) {
      for (const row of rawData) {
        result.rewards.push({
          roundIndex: row.realroundindex,
          collator: row.collator,
          reward: row.reward,
        });
      }

      result.totalCount = rawData.length;
    }
    return result;
  }

  async atStake(request: StakeSnapshotRequest): Promise<any> {
    //目前我们有每个round的totalBond， 如何计算出collator bond是关键
    //研究数据发现：
    //1. collatorActionHistory 里的balancecurrent是该collator质押的数量， 而且已经是一个累计的值。
    //2. 如果collator节点没有joinedCollatorCandidates这个事件， 则它默认的初始质押数量=1000；
    //   如果collator节点存在joinedCollatorCandidates这个事件， 则它的初始质押数量=距离最近的一个roundIndex 发生的collatorActionHistory.balancecurrent；
    //解决方案：
    // 在索引数据时，更新round_collator.selfbond 这个值， 这个值即是collator 质押数量

    let result = {
      startRoundIndex: request.startRoundIndex,
      endRoundIndex: request.endRoundIndex,
      stakes: [],
      totalCollatorCount: 0,
    };

    let query = `
                SELECT
                  roundindex,account,
                  sum( selfbond ) AS selfbond,
                  sum( totalbond ) AS totalbond 
                FROM
                  round_collators
                WHERE
                  roundindex BETWEEN ${request.startRoundIndex}	AND ${request.endRoundIndex}  `;

    if (request.collatorAccount) {
      query += ` AND account ='${request.collatorAccount}' `;
    }
    query += ` GROUP BY  roundindex ,account `;
    query += ` ORDER BY roundindex,account `;

    let records = await DbManager.get(request).rcRepository.query(query);
    if (records && records.length > 0) {
      for (let index = 0; index < records.length; index++) {
        const record = records[index];

        result.stakes.push({
          roundIndex: record.roundindex,
          collatorAccount: record.account,
          total: record.totalbond,
          collatorStake: record.selfbond,
          nominatorsStake: record.totalbond - record.selfbond,
        });
      }
      result.totalCollatorCount = records.length;
    }

    return result;
  }
  private getChainConnect(chainId) {
    return ChainConnectManager.get(chainId);
  }
  async getLatestBlockNumber(chainId: string): Promise<number> {
    return this.getChainConnect(chainId).getLatestBlockNumber();
  }
  async getCurrentRoundInfo(chainId: string): Promise<any> {
    return this.getChainConnect(chainId).getCurrentRoundInfo();
  }
  async getMaxNominatorsPerCollator(chainId: string): Promise<any> {
    return this.getChainConnect(chainId).getMaxNominatorsPerCollator();
  }
  async getRealtimeCollatorCandidatePool(chainId: string): Promise<any> {
    return this.getChainConnect(chainId).getRealtimeCollatorCandidatePool();
  }
  async getRealtimeCollatorState(
    chainId: string,
    collatorAccounts: string[]
  ): Promise<any> {
    return this.getChainConnect(chainId).getRealtimeCollatorState(
      collatorAccounts
    );
  }
  async getScheduledExitQueue(chainId: string): Promise<any> {
    return this.getChainConnect(chainId).getScheduledExitQueue();
  }
  async getSelectedCollators4CurrentRound(chainId: string): Promise<any> {
    return this.getChainConnect(chainId).getSelectedCollators4CurrentRound();
  }

  async getMaxCollatorsPerRound(chainId: string): Promise<number> {
    let record = await DbManager.get(chainId).cnhRepository.findOne({
      order: {
        roundindex: "DESC",
      },
    });
    if (record) {
      return record.new;
    } else {
      let record = await DbManager.get(chainId).chainStateRepository.findOne({});
      if (record) {
        return record.maxCollatorCount;
      }
    }
    return 64;
  }
}
