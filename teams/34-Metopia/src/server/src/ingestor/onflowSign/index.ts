import { jsonParse } from '../../helpers/utils';
import writer from '../../writer';
import * as fcl from "@onflow/fcl"

// ex: 
// let msg = {a: 1, b:2 };
// let msg_str = JSON.stringify(msg);
const hashMessage = (msg_str) => {
  let hash = Buffer.from(msg_str).toString("hex");
  return hash;
}
async function verifySignature(
  sig: any,
  hash: string
): Promise<boolean> {

  // addr: "0xf62b705766db0b32"
  // f_type : "CompositeSignature"
  // f_vsn : "1.0.0"
  // keyId : 3
  // signature : "451dbabebcd38ac873b095045a45f96ae880ccaeba382aa6e48feb4c22c26248a29146e04cabd6b00d4f36338931d7a6002185f8b4babc7e1464c26d9f93a7bb"

  // sig: [{f_type: "CompositeSignature", f_vsn: "1.0.0", addr: "0x123", keyId: 0, signature: "abc123"}],
  const isValid = await fcl.AppUtils.verifyUserSignatures(
    hash,
    sig
  )
  // console.log('isValid:', isValid);

  return await isValid;
}

export default async function ingestor(body) {

  if (!body || !body.address || !body.msg || !body.sig)
    return Promise.reject('wrong message body');

  const msg = body.msg;
  const sig = body.sig;


  // if (Object.keys(msg).length !== 5 || !msg.space || !msg.payload || Object.keys(msg.payload).length === 0)
  //   return Promise.reject('wrong signed message');

  if (JSON.stringify(body).length > 1e5)
    return Promise.reject('too large message');

  // if (!spaces[msg.space] && msg.type !== 'settings')
  //   return Promise.reject('unknown space');

  // if (!msg.version || msg.version !== pkg.version)
  //   return Promise.reject('wrong version');

  // if (!msg.type || !Object.keys(writer).includes(msg.type))
  //   return Promise.reject('wrong message type');



  console.log('msg::', msg);
  // console.log('sig::', sig);
  console.log('address:', body.address);

  const hash = hashMessage(JSON.stringify(msg));
  // let json_msg = JSON.stringify(msg);
  // const hash_msg = Buffer.from(json_msg).toString("hex");


  if (!(await verifySignature(sig, hash))) {
    return Promise.reject('wrong signature');
  }

  console.log('verify success.');

  // try {
  //   if (msg.type == 'single-choice') {

  //     console.log('msg.type:', msg.type);

  //     await writer['proposal'].verify(body);

  //   } else {

  //     await writer[msg.type].verify(body);

  //   }
  // } catch (e) {
  //   return Promise.reject(e);
  // }

  try {
    let payload = {};
    let type = msg.type == 'single-choice' ? 'proposal' : msg.type;
    let id = '0x' + (hash.length > 64 ? hash.substr(0, 64) : hash);

    // if(msg.type == 'single-choice'){

    if (type === 'proposal') {
      payload = {
        name: msg.title,
        body: msg.body,
        choices: msg.choices,
        start: msg.start,
        end: msg.end,
        snapshot: msg.snapshot,
        network: msg.network,
        metadata: {
          plugins: JSON.parse(msg.plugins),
          network: msg.network,
          strategies: JSON.parse(msg.strategies),
          ...JSON.parse(msg.metadata)
        },
        type: msg.type
      };
    }


    if (type === 'delete-proposal') {
      payload = { proposal: msg.proposal };
    }

    if (['vote', 'vote-array', 'vote-string'].includes(type)) {
      let choice = msg.choice;
      if (type === 'vote-string') choice = JSON.parse(msg.choice);
      payload = {
        proposal: msg.proposal,
        choice,
        metadata: JSON.parse(msg.metadata)
      };
      type = 'vote';
    }

    let legacyBody = {
      address: body.address,
      msg: JSON.stringify({
        version: 'domain.version',
        timestamp: msg.timestamp,
        space: msg.space,
        type,
        payload
      }),
      sig: body.sig
    };

    if (
      ['follow', 'unfollow', 'alias', 'subscribe', 'unsubscribe'].includes(type)
    ) {
      legacyBody = msg;
    }

    console.log('type:', type);

    await writer[type].verify(legacyBody);
    await writer[type].action(legacyBody, '', 'receipt', id);

  } catch (e) {
    return Promise.reject(e);
  }
  return "ok";
}
