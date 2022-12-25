import { W3Logger } from 'src/common/log/logger.service';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { FunctionExt } from 'src/common/utility/functionExt';
import BigNumber from 'bignumber.js';
import { ChainUtils } from './chain-utils';
import { ParachainNetwork } from './chain-network';
import { Injectable } from '@nestjs/common';

// @Injectable()
export class ChainConnector {

  private BREAK_CHANGE_SPEC_VERSION = 0;

  async atStake(roundIndex: number, collatorAccount: string): Promise<any> {
    await this.checkReady();
    const atStake = await this.api.query.parachainStaking.atStake(
      roundIndex,
      collatorAccount,
    );
    let json = atStake.toJSON();
    this.logger.debug('atStake:' + JSON.stringify(json));
    return json;
  }
  async getLatestBlockNumber(): Promise<number | PromiseLike<number>> {
    await this.checkReady();
    const number = await this.api.query.system.number();
    let blocknumber = Number(number);
    this.logger.debug('getLatestBlockNumber:' + blocknumber);
    return blocknumber;
  }
  async getCurrentRoundInfo(): Promise<any> {
    await this.checkReady();
    const round = await this.api.query.parachainStaking.round();
    let roundInfo = round.toJSON();

    let data = (await this.api.query.balances.totalIssuance()) as unknown as any;
    let formatSymbolDecimals = new BigNumber('1e' + this.network.decimals[0])
    let value = new BigNumber(data.toString()).div(formatSymbolDecimals).toNumber();
    roundInfo["totalIssuance"] = value;
    this.logger.debug('getCurrentRoundInfo:' + JSON.stringify(roundInfo));

    return roundInfo;
  }
  async getSelectedCollators4CurrentRound(): Promise<any> {
    await this.checkReady();
    const selectedCandidates =
      await this.api.query.parachainStaking.selectedCandidates();
    let candidates = selectedCandidates.toJSON() as any;
    if (candidates) {
      for (let index = 0; index < candidates.length; index++) {
        const c = candidates[index];
        let convertedAddress = ChainUtils.ss58transform_simple(c, this.network);
        // this.logger.debug(`convertedAddress: ${c}=>${convertedAddress}`);
        candidates[index] = convertedAddress;
      }
    }
    this.logger.debug('getSelectedCollators4CurrentRound:' + JSON.stringify(candidates));
    return candidates;
  }

  async getRealtimeCollatorCandidatePool(): Promise<any> {
    await this.checkReady();
    const candidatePool = await this.api.query.parachainStaking.candidatePool();
    let cps = candidatePool.toJSON() as any;

    for (let index = 0; index < cps.length; index++) {
      const cp = cps[index];
      let convertedAddress = ChainUtils.ss58transform_simple(cp.owner, this.network);
      cps[index].owner = convertedAddress;
    }
    this.logger.debug('getRealtimeCollatorCandidatePool:' + JSON.stringify(cps));

    return cps;
  }

  async getRealtimeCollatorState(collatorAccounts: string[]): Promise<any> {
    await this.checkReady();
    let result = [];

    let collatorAccounts_publickey = [];
    for (const a of collatorAccounts) {
      let pk = ChainUtils.ss58transform_publickey(a);
      collatorAccounts_publickey.push(pk);
    }
    this.logger.debug('collatorAccounts_publickey:' + JSON.stringify(collatorAccounts_publickey));

    let specVersion = this.getSpecVersion();
    if (specVersion < this.BREAK_CHANGE_SPEC_VERSION) {
      //
    } else {
      const multiCandidateInfos =
        await this.api.query.parachainStaking.candidateInfo.multi(
          collatorAccounts_publickey,
        );
      this.logger.debug(`multiCandidateInfos ${JSON.stringify(multiCandidateInfos)}`);

      const multiTopDelegations =
        await this.api.query.parachainStaking.topDelegations.multi(
          collatorAccounts_publickey,
        );
      this.logger.debug(`multiTopDelegations ${JSON.stringify(multiTopDelegations)}`);

      const multiBottomDelegations =
        await this.api.query.parachainStaking.bottomDelegations.multi(
          collatorAccounts_publickey,
        );
      this.logger.debug(`multiBottomDelegations ${JSON.stringify(multiBottomDelegations)}`);

      for (let index = 0; index < multiCandidateInfos.length; index++) {
        let candidateInfo = multiCandidateInfos[index].toJSON() as any;
        if (!candidateInfo) {
          continue;
        }
        candidateInfo.id = collatorAccounts[index];
        //this.logger.debug('candidateInfo.id:', candidateInfo.id);

        if (multiTopDelegations.length > index) {
          let topDelegations = multiTopDelegations[index].toJSON() as any;
          //this.logger.debug('topDelegations:', topDelegations);
          if (topDelegations.delegations) {
            candidateInfo.topDelegations = topDelegations.delegations;

            for (const d of candidateInfo.topDelegations) {
              d.pk = d.owner;
              d.owner = ChainUtils.ss58transform_simple(d.pk, this.network);
            }
          }
        }
        if (multiBottomDelegations.length > index) {
          let bottomDelegations = multiBottomDelegations[index].toJSON() as any;
          //this.logger.debug('bottomDelegations:', bottomDelegations);
          if (bottomDelegations.delegations) {
            candidateInfo.bottomDelegations = bottomDelegations.delegations;
            for (const d of candidateInfo.bottomDelegations) {
              d.pk = d.owner;
              d.owner = ChainUtils.ss58transform_simple(d.pk, this.network);
            }
          }
        }
        result.push(candidateInfo);
      }

    }

    return result;
  }

  async getScheduledExitQueue(): Promise<any> {
    await this.checkReady();
    const exitQueue2 = await this.api.query.parachainStaking.exitQueue2();
    let json = exitQueue2.toJSON();
    this.logger.debug('getScheduledExitQueue:' + JSON.stringify(json));
    return json;
  }

  async getMaxNominatorsPerCollator(): Promise<any> {
    await this.checkReady();
    let json = {};
    let sepcVersion = this.getSpecVersion();
    if (sepcVersion < this.BREAK_CHANGE_SPEC_VERSION) {
      const value = await this.api.consts.parachainStaking
        .maxDelegatorsPerCandidate;
      json = value.toJSON();
    } else {

      const value = await this.api.consts.parachainStaking
        .maxTopDelegationsPerCandidate;
      json = value.toJSON();
    }
    this.logger.debug('maxTopDelegationsPerCandidate:' + JSON.stringify(json));
    return json;
  }



  private wsProvider: WsProvider;
  api: ApiPromise;
  private systemVersion: any;
  private logger: W3Logger;
  constructor(readonly network: ParachainNetwork["info"], readonly defaultValues: ParachainNetwork["defaultValues"]) {
    this.logger = new W3Logger('chain-contector:' + network.network);
    this.init();
  }

  async init() {
    const wssEndpoint = this.network.wssEndpoints[0];
    //this.modulePrefix = this.network.prefix[0];
    //this.logger.modulePrefix = this.network.network;
    this.logger.debug('init wssEndpoint:' + wssEndpoint);
    // const types = Object.values(definitions).reduce(
    //   (res, { types }): object => ({ ...res, ...types }),
    //   {},
    // );
    this.wsProvider = new WsProvider(wssEndpoint);
    this.api = await ApiPromise.create({
      provider: this.wsProvider,
      // types: {
      //   ...types,
      // },
    });

    this.wsProvider.on('connected', (val) => {
      this.logger.debug('connected:' + val);
    });
    this.wsProvider.on('disconnected', (val) => {
      this.logger.debug('disconnected:' + val);
    });
    this.wsProvider.on('error', (val) => {
      this.logger.error('error:' + val);
    });

    //
    this.logger.debug('chain genesisHash:' + this.api.genesisHash.toHex());

    await this.checkReady();

    await this.getSystemVersion();
  }

  async checkReady() {
    let isReady = this.wsProvider.isConnected;
    let maxWait = 30;
    while (!isReady && maxWait > 0) {
      maxWait--;
      await FunctionExt.sleep(1000);
    }
    if (isReady) {
      this.logger.debug('checkReady pass, the connection is avaliable');
    }
    else {
      this.logger.warn('checkReady failed , reInit the connection');
      await this.init();
    }
  }
  async getSystemVersion() {
    const version = await this.api.consts.system.version.toJSON();
    if (version) {
      this.logger.verbose(`getSystemVersion: ${JSON.stringify(version)}`);
      this.systemVersion = version;
    } else {
      this.systemVersion = {};
    }
  }
  getSpecVersion() {
    let specVersion = 0;
    if (this.systemVersion && this.systemVersion.specVersion) {
      specVersion = Number(this.systemVersion.specVersion);
    }
    this.logger.verbose(`found runtime specVersion ${specVersion}`);
    return specVersion;
  }

  divider:BigNumber;
  formatWithDecimals(value): BigNumber {
    if (!this.divider) {
      this.divider = new BigNumber("1e" + this.network.decimals[0]);
    }
    return BigNumber(value).dividedBy(this.divider);
  }

}
