import isEqual from 'lodash/isEqual';
import { jsonParse } from '../helpers/utils';
// import { spaces } from '../helpers/spaces';
import db from '../helpers/mysql';

export async function verify(body): Promise<any> {
  const msg = jsonParse(body.msg);

  // if (
  //   msg.payload.type === 'basic' && !isEqual(['For', 'Against', 'Abstain'], msg.payload.choices)
  // ) {
  //   return Promise.reject('wrong choices for basic type voting');
  // }

  // const space = spaces[msg.space];
  // space.id = msg.space;

  // if (space.voting?.delay) {
  //   const isValidDelay =
  //     msg.payload.start === parseInt(msg.timestamp) + space.voting.delay;

  //   if (!isValidDelay) return Promise.reject('invalid voting delay');
  // }

  // if (space.voting?.period) {
  //   const isValidPeriod = msg.payload.end - msg.payload.start === space.voting.period;
  //   if (!isValidPeriod) return Promise.reject('invalid voting period');
  // }

  console.log('msg::', msg);
 
}

export async function action(body, ipfs, receipt, id): Promise<void> {

  console.log('body::', body);

  const msg = jsonParse(body.msg);
  const space = msg.space;

  /* Store the messages in table 'messages' */
  await db.queryAsync('INSERT IGNORE INTO messages SET ?', [
    {
      id,
      ipfs,
      address: body.address,
      version: msg.version,
      timestamp: msg.timestamp,
      space,
      type: 'proposal',
      sig: body.sig,
      receipt
    }
  ]);

  // const spaceSettings = [
  //     {
  //         "name": "balanceof-flow-nft",
  //         "params": {
  //             "address": "0x748ba1169990e79f",
  //             "network": "testnet",
  //         }
  //     }
  // ]
  const author = body.address;

  // const created = parseInt(msg.timestamp);
  // const metadata = msg.payload.metadata || {};
  // const strategies = JSON.stringify(spaceSettings);
  // const network = msg.payload.network; 
  // const proposalSnapshot = parseInt(msg.payload.snapshot || '0');
  console.log('msg.payload:', msg.payload);
  const proposal = {
    id,
    ipfs,
    author,
    created: parseInt(msg.timestamp),
    space,
    network: msg.payload.network,
    type: msg.payload.type || 'single-choice',
    strategies: JSON.stringify(msg.payload.metadata.strategies),
    plugins: '{}',
    title: msg.payload.name,
    body: msg.payload.body,
    choices: JSON.stringify(msg.payload.choices),
    start: parseInt(msg.payload.start || '0'),
    end: parseInt(msg.payload.end || ''),
    snapshot: 0,
    scores: '[]',
    scores_by_strategy: '[]',
    scores_state: '',
    scores_total: 0,
    scores_updated: 0,
    votes: 0
  };
  let query = 'INSERT IGNORE INTO proposals SET ?; ';
  const params: any[] = [proposal];

  /* Store events in database */
  const event = {
    id: `proposal/${id}`,
    space
  };
  const ts = Date.now() / 1e3;

  query += 'INSERT IGNORE INTO events SET ?; ';
  params.push({
    event: 'proposal/created',
    expire: proposal.created,
    ...event
  });

  query += 'INSERT IGNORE INTO events SET ?; ';
  params.push({
    event: 'proposal/start',
    expire: proposal.start,
    ...event
  });

  if (proposal.end > ts) {
    query += 'INSERT IGNORE INTO events SET ?; ';
    params.push({
      event: 'proposal/end',
      expire: proposal.end,
      ...event
    });
  }

  await db.queryAsync(query, params);
  console.log('Store proposal complete', space, id);
}
