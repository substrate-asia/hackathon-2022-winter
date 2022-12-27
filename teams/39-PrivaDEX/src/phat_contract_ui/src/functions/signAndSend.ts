import type { ApiTypes } from '@polkadot/api-base/types/base'
import type { SubmittableExtrinsic } from '@polkadot/api-base/types/submittable'
import type { Signer as InjectedSigner } from '@polkadot/api/types'

const signAndSend = (target: SubmittableExtrinsic<ApiTypes>, address: string, signer: InjectedSigner) => {
  return new Promise(async (resolve, reject) => {
    // Ready -> Broadcast -> InBlock -> Finalized
    const unsub = await target.signAndSend(
      address, { signer }, (result) => {
        const humanized = result.toHuman()          
        if (result.status.isInBlock) {
          let error;
          for (const e of result.events) {
            const { event: { data, method, section } } = e;
            if (section === 'system' && method === 'ExtrinsicFailed') {
              error = data[0];
            }
          }
          // @ts-ignore
          unsub();
          if (error) {
            reject(error);
          } else {
            resolve({
              hash: result.status.asInBlock.toHuman(),
              // @ts-ignore
              events: result.toHuman().events,
            });
          }
        } else if (result.status.isInvalid) {
          // @ts-ignore
          unsub();
          reject('Invalid transaction');
        }
      }
    )
  })
}

export default signAndSend