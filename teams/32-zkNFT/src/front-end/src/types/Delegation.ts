// @ts-nocheck
import Collator from './Collator';

export default class Delegation {
  constructor(delegatorAddress, collatorAddress, delegatedBalance) {
    this.delegatorAddress = delegatorAddress;
    this.collator = new Collator(collatorAddress);
    this.delegatedBalance = delegatedBalance;
    this.rank = null;
  }

  setRank(rank) {
    this.rank = rank;
  }

  gte(other) {
    return this.delegatedBalance.gte(other.delegatedBalance);
  }
}
