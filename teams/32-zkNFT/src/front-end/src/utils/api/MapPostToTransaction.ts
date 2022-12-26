// @ts-nocheck

import BN from 'bn.js';

const mapPostToTransaction = async (post, api) => {
  post.sources = post.sources.map(source => new BN(source));
  post.sinks = post.sinks.map(sink => new BN(sink));

  let sources = post.sources.length;
  let senders = post.sender_posts.length;
  let receivers = post.receiver_posts.length;
  let sinks = post.sinks.length;

  if (sources == 1 && senders == 0 && receivers == 1 && sinks == 0) {
    const mint_tx = await api.tx.zknft.toPrivate(post);
    return mint_tx;
  } else if (sources == 0 && senders == 2 && receivers == 2 && sinks == 0) {
    const private_transfer_tx = await api.tx.zknft.privateTransfer(post);
    return private_transfer_tx;
  } else if (sources == 0 && senders == 2 && receivers == 1 && sinks == 1) {
    const reclaim_tx = await api.tx.zknft.toPublic(post);
    return reclaim_tx;
  } else {
    throw new Error(
      'Invalid transaction shape; there is no extrinsic for a transaction'
          + `with ${sources} sources, ${senders} senders, `
          + ` ${receivers} receivers and ${sinks} sinks`
    );
  }
};

export default mapPostToTransaction;
