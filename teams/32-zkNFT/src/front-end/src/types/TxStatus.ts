// @ts-nocheck
const FINALIZED = 'finalized';
const FAILED = 'failed';
const PROCESSING = 'processing';

export default class TxStatus {
  constructor(status, extrinsic = null, block = null, message = null) {
    this.status = status;
    this.extrinsic = extrinsic;
    this.block = block;
    this.message = message;
    this.batchNum = null;
    this.totalBatches = null;
  }

  static processing(message) {
    return new TxStatus(PROCESSING, null, null, message);
  }

  static finalized(extrinsic, block) {
    return new TxStatus(FINALIZED, extrinsic, block, null);
  }

  static failed(block, message) {
    return new TxStatus(FAILED, null, block, message);
  }

  isProcessing() {
    return this.status === PROCESSING;
  }

  isFinalized() {
    return this.status === FINALIZED;
  }

  isFailed() {
    return this.status === FAILED;
  }

  toString() {
    let message = this.status;
    if (this.block) {
      message += `;\n block hash: ${this.block}`;
    }
    if (this.message) {
      message += `;\n ${this.message}`;
    }
    return message;
  }
}
