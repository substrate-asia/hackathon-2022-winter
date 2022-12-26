// @ts-nocheck
import { SECONDS_PER_BLOCK } from 'pages/StakePage/StakeConstants';
import { formatDaysHoursMinutes } from 'utils/time/timeString';
import Collator from './Collator';

export default class UnstakeRequest {
  constructor(
    collatorAddress,
    unstakeAmount,
    epochWhenExecutable,
    round,
    currentBlockNumber
  ) {
    this.collator = new Collator(collatorAddress);
    this.unstakeAmount = unstakeAmount;
    this.epochWhenExecutable = epochWhenExecutable;
    this.canWithdraw = this._getCanWithdraw(round);
    this.timeRemainingString = this._getTimeRemainingString(round, currentBlockNumber);
  }

  _getCanWithdraw(round) {
    const roundsRemaining = this.epochWhenExecutable - round.current;
    return roundsRemaining <= 0;
  }

  _getTimeRemainingString(round, currentBlockNumber) {
    if (this.canWithdraw) {
      return 'Ready';
    }
    const roundsRemaining = this.epochWhenExecutable - round.current;
    const currentRoundFinalBlock = round.first.toNumber() + round.length.toNumber();
    const blocksRemainingInRound = currentRoundFinalBlock - currentBlockNumber;
    const timeRemainingSeconds = ((roundsRemaining * round.length.toNumber()) + blocksRemainingInRound) * SECONDS_PER_BLOCK;
    return formatDaysHoursMinutes(timeRemainingSeconds);
  }

}
