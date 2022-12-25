import { Controller, Get, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import BigNumber from "bignumber.js";
import { ChainConnector } from "src/common/chain/chain-connector";
import { ParachainNetwork } from "src/common/chain/chain-network";
import { ChainUtils } from "src/common/chain/chain-utils";
import { StatCollator } from "src/common/entity/StakingModule/StatCollator.entity";
import { StatDelegator } from "src/common/entity/StakingModule/StatDelegator.entity";
import { StatNetwork } from "src/common/entity/StakingModule/StatNetwork.entity";
import { W3Logger } from "src/common/log/logger.service";
import { StakingBaseService } from "../base/service/staking-base-service";
import { ChainConnectManager } from "../core/chain/chain-connect-manager";
import { DbManager } from "../core/db/db-manager";

import { parachainNetworks } from "../core/register/chain-network-register";
import { ServiceManager } from "../core/service/service-manager";
import { CollatorService } from "./service/collator-service";

@Injectable()
export class StatDataSyncTask {
  private pending = false;
  private taskStartedAt;

  private logger: W3Logger;

  constructor(
    private serviceManager: ServiceManager,
    private collatorService: CollatorService
  ) {
    this.logger = new W3Logger("StatDataSyncTask");
  }

  private getElapsedTimeInSec(date = this.taskStartedAt) {
    const now = new Date().getTime();
    return Number((now - date.getTime()) / 1000);
  }

  @Cron("0 */5 * * * *")
  cal() {
    //console.info("executed...");

    this.doit();
  }
  // todo test code
  // private
  async doit() {
    if (this.pending) {
      this.logger.warn(
        `last task started ${this.getElapsedTimeInSec()}s ago and yet to be done.`
      );
      return;
    }
    this.taskStartedAt = new Date();
    this.pending = true;

    try {
      for (const network of parachainNetworks) {
        const chain = ChainConnectManager.get(network.info.id);
        const baseService: StakingBaseService = this.serviceManager.getService(
          { chainId: chain.network.id },
          StakingBaseService.name
        );

        const shareData = await this.buildCollatorsAndSharedData(
          chain,
          baseService
        );
        const collators = await this.getStatCollators(
          chain,
          baseService,
          shareData
        );
        const statNetwork = this.getStatNetwork(network, collators);
        const delegators = await this.getStatDelegator(network, shareData);

        // https://docs.nestjs.com/v7/techniques/database#transactions
        await this.doSave(network, StatNetwork, "stat_network", [statNetwork]);
        await this.doSave(network, StatCollator, "stat_collator", collators);
        await this.doSave(network, StatDelegator, "stat_delegator", delegators);
      }
    } catch (e) {
      this.logger.warn(
        `task quited unexpectly, task consumed ${this.getElapsedTimeInSec()}s`,
        e
      );
    } finally {
      this.pending = false;
      console.warn(`the task finished in ${this.getElapsedTimeInSec()}s.`);
    }
    // parachainNetworks.forEach((network) => {});
  }

  private async doSave(
    network: ParachainNetwork,
    entityClzRef,
    tableName,
    data: Array<any>
  ) {
    const queryRunner = DbManager.get(
      network.info.id
    ).dbConnect.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // truncate enjoyed the hight efficency but also sacrifice the transaction
      // queryRunner.manager.query("truncate stat_network");
      // queryRunner.manager.query("truncate stat_collator");
      // queryRunner.manager.query("truncate stat_delegator");
      //console.info('starting cleaning old data...');

      // queryRunner.manager.query("delete from stat_network");
      // queryRunner.manager.query("delete from stat_collator");
      // queryRunner.manager.query("delete from stat_delegator");
      queryRunner.manager.query(`delete from ${tableName}`);
      this.logger.debug(
        `finished cleaning old data in ${tableName}...total: ${data.length} network: ${network.info.id}`
      );

      //queryRunner.manager.query('truncate stat_delegator');

      this.logger.debug(
        `starting save data...${tableName} total: ${data.length} network: ${network.info.id}`
      );
      // let i = 0;
      // for (const record of data) {
      //   if (i++ % 100 === 0) {
      //     this.logger.debug(
      //       `saving process: ${i}/${data.length} network: ${
      //         network.info.id
      //       }, task elapsed ${this.getTaskElapsedTimeInSec()}s`
      //     );
      //   }
      //   await queryRunner.manager.save(record);
      // }
      await queryRunner.manager.insert(entityClzRef, data);
      this.logger.debug(
        `save done: ${data.length} records network: ${
          network.info.id
        }, whole task spent ${this.getElapsedTimeInSec()}s`
      );

      //console.info('commiting..');
      await queryRunner.commitTransaction();
    } catch (err) {
      //console.error(err);
      this.logger.error(
        `task encounted DB errors, network: ${
          network.info.id
        }, task elapsed ${this.getElapsedTimeInSec()}s`,
        err
      );
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  private async buildCollatorsAndSharedData(
    chain: ChainConnector,
    baseService: StakingBaseService
  ) {
    const chainId = chain.network.id;

    const candidatePool = (
      await chain.api.query.parachainStaking.candidatePool()
    ).toJSON() as any;
    const collators = [];
    const collatorDataMap = {};
    const collatorData = [] as Array<StatCollator>;
    if (candidatePool) {
      for (const it of candidatePool) {
        const c = new StatCollator();
        c.collator = ChainUtils.ss58transform_simple(it.owner, chain.network);
        c.totalStake = chain.formatWithDecimals(it.amount).toNumber();
        c.selfStake = 0;
        c.latestReward = 0;
        c.totalReward = 0;
        c.timestamp = this.taskStartedAt;
        collators.push(c.collator);
        collatorData.push(c);
        collatorDataMap[c.collator] = c;
      }
    }

    const round = (await chain.api.query.parachainStaking.round()).toJSON() as {
      current;
      first;
      length;
      totalIssuance;
    };

    // const rewards = (
    //   await baseService.getCollatorTotalReward({
    //     chainId,
    //     collators: collators,
    //   })
    // ).collators;
    const collatorReward = (
      await baseService.getCollatorReward({
        chainId,
        startRoundIndex: round.current - 11 - 0,
        endRoundIndex: round.current - 1 - 0,
        accounts: collators,
      })
    ).rewards;

    const shareData = {
      chainId,
      collators,
      collatorData,
      collatorDataMap,
      topDelegators: null,
      bottomDelegators: null,
      collatorReward,
      realtimeCollatorState: await chain.getRealtimeCollatorState(collators),
      round,
    };
    await this.loadDelegators(chain, shareData, chain.network);
    return shareData;
  }
  private async getStatCollators(
    chain: ChainConnector,
    baseService: StakingBaseService,
    shareData
  ) {
    const chainId = chain.network.id;

    const { collatorData } = shareData;

    this.doRank("totalStake", "totalStakeRank", collatorData);
    await this.batchCalStake(chain, shareData);
    await this.batchCalMinBond(chain, shareData);
    await this.batchCalReward(shareData);
    await this.collatorService.batchCalApr(baseService, chain, shareData);
    this.doRank("apr", "aprRank", collatorData);
    await this.collatorService.batchCalAvgBlock(baseService, chain, shareData);
    for (const roundSize of [1, 3, 4, 5, 8, 10]) {
      this.doRank(
        `avgBlockIn${roundSize}R`,
        `avgBlockRankIn${roundSize}R`,
        collatorData
      );
    }

    // common datas
    // for (const it of candidatePool) {
    //   await this.calReward(baseService, chainId, it.owner);
    //   it.minBond = 0;
    //   //   collators.push(c);
    // }
    return collatorData;
  }

  private getStatNetwork(network: ParachainNetwork, collators: StatCollator[]) {
    const stat = new StatNetwork();
    stat.chainId = network.info.id;
    stat.token = network.info.symbols[0];
    stat.collatorCount = collators.length;
    stat.highestApr = 0;
    stat.delegatorCount = 0;
    stat.totalStake = 0;
    stat.totalReward = 0;
    stat.timestamp = this.taskStartedAt;
    collators.forEach((collator) => {
      stat.highestApr = Math.max(stat.highestApr, collator.apr);
      stat.delegatorCount = stat.delegatorCount + collator.delegatorCount;
      stat.totalStake = stat.totalStake + collator.totalStake;
      stat.totalReward = stat.totalReward + collator.totalReward;
    });
    return stat;
  }

  private async getStatDelegator(
    network: ParachainNetwork,
    shareData
  ): Promise<StatDelegator[]> {
    const { collators, topDelegators, bottomDelegators } = shareData;
    const delegators = [] as StatDelegator[];
    for (let i = 0; i < collators.length; i++) {
      const collator = collators[i];
      const tops = topDelegators[i].delegations;
      const bottoms = bottomDelegators[i].delegations;
      if (tops.length < 1) continue;

      const existedRecords = await this.collatorService.getStatCollatorsHisBy({
        chainId: network.info.id,
        collator,
      });

      let rank = 1;
      for (const groupData of [{ top: true, data: tops }, { data: bottoms }]) {
        if (groupData.data.length < 1) continue;
        const dataMap = {};
        for (const d of groupData.data) {
          const delegator = new StatDelegator();
          delegator.collator = collator;
          delegator.delegator = d.owner;
          delegator.stake = d.amount;
          delegator.rank = rank++;
          delegator.isInTop = groupData.top ? 1 : 0;
          delegator.reward = 0;
          delegator.latestReward = 0;
          delegator.latestRewardBlock = 0;
          delegator.timestamp = this.taskStartedAt;
          delegators.push(delegator);
          dataMap[d.owner] = delegator;
        }
        // new records
        await this.batchCalRewards4StatDelegators({
          chainId: network.info.id,
          dataMap,
          collator,
          existedRecords,
          delegators: groupData.data
            .filter((it) => !existedRecords[it.owner])
            .map((it) => it.owner),
          isIncre: false,
        });
        // increment
        await this.batchCalRewards4StatDelegators({
          chainId: network.info.id,
          dataMap,
          collator,
          existedRecords,
          delegators: groupData.data
            .filter((it) => !!existedRecords[it.owner])
            .map((it) => it.owner),
          isIncre: true,
        });
      }
    }
    return delegators;
  }

  private async batchCalRewards4StatDelegators({
    chainId,
    existedRecords,
    dataMap,
    collator,
    delegators,    
    isIncre
  }) {
    if (!delegators || !delegators.length) {
      return;
    }
    let startTime = null;
    let endTime = this.taskStartedAt;
    if (isIncre) {
      startTime = existedRecords[delegators[0]].timestamp as Date;
      // no matter existed records has further updates, we needs to keep the legacy data
      delegators.forEach(delegator => {
        dataMap[delegator].reward = existedRecords[delegator].reward - 0;
        dataMap[delegator].latestReward = existedRecords[delegator].latestReward;
        dataMap[delegator].latestRewardBlock = existedRecords[delegator].latestRewardBlock;
      })
    }
    let rewards = await this.collatorService.statDelegatorsReward({
      chainId,
      collator,
      delegators,
      startTime,
      endTime
    });
    rewards.forEach((reward) => {
      dataMap[reward.delegator].reward =
        reward.reward - 0 + (isIncre ? (dataMap[reward.delegator].reward - 0) : 0);
      dataMap[reward.delegator].latestReward = reward.latestReward;
      dataMap[reward.delegator].latestRewardBlock = reward.latestRewardBlock;
    });
  }

  private async loadDelegators(
    chain,
    shareData,
    network: ChainConnector["network"]
  ) {
    const multiData2JSON = (arr) => {
      const res = [];
      for (const it of arr) {
        const d = it.toJSON();
        res.push(d);
        d.delegations &&
          d.delegations.forEach((delegator) => {
            delegator.owner = ChainUtils.ss58transform_simple(
              delegator.owner,
              network
            );
            delegator.amount = chain
              .formatWithDecimals(delegator.amount)
              .toNumber();
          });
      }
      return res;
    };

    shareData.topDelegators = multiData2JSON(
      await chain.api.query.parachainStaking.topDelegations.multi(
        shareData.collators
      )
    );
    shareData.bottomDelegators = multiData2JSON(
      await chain.api.query.parachainStaking.bottomDelegations.multi(
        shareData.collators
      )
    );
    // update delegatorCount
    shareData.collators.forEach((collator, i) => {
      shareData.collatorDataMap[collator].delegatorCount =
        shareData.topDelegators[i].delegations.length +
        shareData.bottomDelegators[i].delegations.length;
    });
  }

  private async batchCalReward(shareData) {
    const { collatorReward, collatorDataMap } = shareData;
    //if (!rewards.length) return;
    const max = {}; // {collator: [roundIndex, maxValue] }
    for (const reward of collatorReward) {
      const collator = reward.account;
      collatorDataMap[collator].totalReward += reward.reward;
      max[collator] = max[collator] || [0, 0];
      if (max[collator][0] < reward.roundIndex) {
        max[collator][1] = reward.reward;
      }
    }
    for (const collator in max) {
      collatorDataMap[collator].latestReward = max[collator][1];
    }
  }

  private async batchCalStake(chain: ChainConnector, shareData) {
    const { collators, collatorDataMap } = shareData;
    const rawData = await chain.api.query.parachainStaking.candidateInfo.multi(
      collators
    );

    const dataMap = {};
    rawData
      .map((it) => it.toJSON())
      .forEach((it: any, i) => {
        dataMap[collators[i]] = chain.formatWithDecimals(it.bond).toNumber();
      });

    for (const collator of collators) {
      collatorDataMap[collator].selfStake = dataMap[collator] || 0;
      collatorDataMap[collator].delegatorStake =
        collatorDataMap[collator].totalStake -
        collatorDataMap[collator].selfStake;
    }
  }

  // if the Top Delegator List has not been full yet (capacity of the list
  // is an constant defined in parachain.constant.maxTopDelegationsPerCandidate),
  // it would be higher than the last one on the list,
  // or it would be the default value of each network’s.
  private batchCalMinBond(chain: ChainConnector, shareData) {
    const defaultMinBondValue = chain.defaultValues.minBond;
    const { collators, collatorDataMap } = shareData;
    const maxTopDelegationsPerCandidate =
      chain.api.consts.parachainStaking.maxTopDelegationsPerCandidate;
    for (let i = 0; i < collators.length; i++) {
      const collator = collators[i];
      const row = collatorDataMap[collator];

      row.minBond = defaultMinBondValue;

      const tdr = shareData.topDelegators[i];
      if (tdr.delegations < 1) continue;

      const last = tdr.delegations[tdr.delegations.length - 1].amount;
      if (tdr.delegations.length === maxTopDelegationsPerCandidate) {
        row.minBond = last + 1;
      } else {
        row.minBond = Math.max(defaultMinBondValue, last);
      }
    }
  }

  private doRank(key: string, rankKey: string, data: Array<any>) {
    const vs = [];
    data.forEach((it) => vs.push(it[key]));
    vs.sort();
    data.forEach((it) => ((it as any)[rankKey] = vs.indexOf(it[key]) + 1));
  }

  private calByNetwork(network) {}
}

// todo  test codes
@Controller("/")
export class DelegatorsScheduleTestController {
  constructor(private cron: StatDataSyncTask) {}

  @Get("/test/cron")
  async test() {
    const now = new Date().getTime();
    await this.cron.doit();
    return `task executed cost ${(new Date().getTime() - now) / 1000}s`;
  }
}
