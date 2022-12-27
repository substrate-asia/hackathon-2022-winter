import express from 'express';
import { sendError } from '../helpers/utils';
import ingestor from '../ingestor';
import pkg from '../../package.json';
import { getProposalScores } from '../scores';
import * as fcl from "@onflow/fcl"

// const account = fcl.account("0x1d007d755706c469");
// console.log('account:', account);

const router = express.Router();
const network = process.env.NETWORK || 'testnet';

fcl.config()
.put("flow.network", "testnet")
.put("accessNode.api", "https://rest-testnet.onflow.org")
.put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
.put("app.detail.title", "Test Harness")
.put("app.detail.icon", "https://i.imgur.com/r23Zhvu.png")
.put("service.OpenID.scopes", "email email_verified name zoneinfo")
.put("0xFlowToken", "0x7e60df042a9c0868")



router.get('/', (req, res) => {
  return res.json({
    name: pkg.name,
    network,
    version: pkg.version,
    tag: 'alpha',
    relayer: ''
  });
});

router.get('/scores/:proposalId', async (req, res) => {
  const { proposalId } = req.params;
  return res.json(await getProposalScores(proposalId));
});


router.post('/msg', async (req, res) => {
  try {
    const result = await ingestor(req.body, 'sub-sign');
    return res.json(result);
  } catch (e) {
    return sendError(res, e);
  }
});



// router.get('/loadSpaces', (req, res) => {
//   let spaces = loadSpaces();
//   return res.json({ spaces });
// });

export default router;
