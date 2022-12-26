// @ts-nocheck
import TxStatus from '../../types/TxStatus';
import getFailedExtrinsicError from './GetFailedExtrinsicError';

export function makeTxResHandler(
  api,
  /* eslint-disable no-unused-vars */
  onSuccess = (block, extrinsic) => null,
  onFailure = (block, error) => null,
  onUpdate = (message) => null
  /* eslint-enable no-unused-vars */
) {
  return async ({ status, events }) => {
    let error,
      extrinsic = '';

    if (status.isInBlock || status.isFinalized) {
      error = getFailedExtrinsicError(events, api);
    }
    if (status.isInBlock && error) {
      onFailure(status.asInBlock.toString(), error);
    } else if (status.isFinalized && error) {
      onFailure(status.asFinalized.toString(), error);
    } else if (status.isFinalized) {
      try {
        const signedBlock = await api.rpc.chain.getBlock(status.asFinalized);
        const extrinsics = signedBlock.block.extrinsics;

        extrinsic =
          extrinsics && extrinsics.length > 0
            ? extrinsics[extrinsics.length - 1].hash.toHex()
            : '';
      } catch (err) {
        console.err(err);
      }
      onSuccess(status.asFinalized.toString(), extrinsic);
    } else {
      onUpdate(status.type);
    }
  };
}

export function makeDefaultTxResHandler(api, setStatus) {
  const onSuccess = (block) => {
    setStatus(TxStatus.finalized(block));
  };
  const onFailure = (block, error) => {
    setStatus(TxStatus.failed(block, error));
  };
  const onUpdate = (message) => {
    setStatus(TxStatus.processing(message));
  };
  return makeTxResHandler(api, onSuccess, onFailure, onUpdate);
}
