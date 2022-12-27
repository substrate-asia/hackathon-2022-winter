import fetch from 'cross-fetch';
import getProposal from '../graphql/operations/proposal';
import getVotes from '../graphql/operations/votes';
import db from '../helpers/mysql';
import basicChoice from './basicChoice';

export async function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

export async function getScores(
    space: string,
    strategies: any[],
    network: string,
    addresses: string[],
    snapshot: number | string = 'latest',
) {
    let scoreApiUrl =  network == 'rmrk' || true ? 'http://47.57.243.177:3004/api/subscores' : 'http://47.57.243.177:3004/api/scores'
    
    try {
        const params = {
          space,
          network:'rmrk',
          snapshot,
          strategies,
          addresses
        };
        // console.log(JSON.stringify({ params }))
        console.log('rmrk params:', JSON.stringify(params));
        
        const res = await fetch(scoreApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params })
        });
        const obj = await res.json();

        console.log(JSON.stringify(obj), JSON.stringify(params))
        let score = obj.result.scores;

        let _scores = Object.keys(score).filter((key) => addresses.map((a) => a.toLowerCase()).includes(key.toLowerCase()))
        .reduce((obj, key) => {
            obj[key] = score[key];
                return obj;
        }, {});
        
        // obj.result.sccores = score

        console.log('sub scores:', _scores)

        return obj.result;
      } catch (e) {
        console.log('rmrk network ex:', e)
        return Promise.reject(e);
      }

    // TODO: get amount from flow blockchain
    // let scores = {
    //     "state": "final",
    //     "scores": [{
    //         "0x3cbAee4F65B64082FD3a5B0D78638Ee11A29A31A": 100,
    //     }]
    // }
    // return scores;
}

export async function getProposalScores(proposalId) {
    try {
        // Get proposal
        const proposal = await getProposal({}, { id: proposalId });

        console.log('proposal::', proposal);
        if (proposal.scores_state === 'final') {
            return {
                scores_state: proposal.scores_state,
                scores: proposal.scores,
                scores_by_strategy: proposal.scores_by_strategy,
                scores_total: proposal.scores_total
            };
        }

        // Get votes
        let votes: any = await getVotes(
            {},
            { first: 100000, where: { proposal: proposalId } },
            {},
            false
        );
        const voters = votes.map(vote => vote.voter);
        
        console.log("api sccores proposal:", proposal.strategies);
        console.log('votes:', votes);

        // Get scores
        const { scores, state } = await getScores(
            proposal.space.id,
            proposal.strategies,
            proposal.network,
            voters,
            parseInt(proposal.snapshot)
        );
        console.log('scores, state:', scores, state);
        
        console.log('votes:', votes);

      
        // Add vp to votes
        votes = votes.map((vote: any) => {
            vote.scores = proposal.strategies.map(
                (strategy, i) => scores[vote.voter] || 0
            );
            vote.balance = vote.scores.reduce((a, b: any) => a + b, 0);
            return vote;
        });

        // Get results
        const choice = new basicChoice(proposal, votes, proposal.strategies);
        console.log('choice:', choice);
        const results = {
            scores_state: proposal.state === 'closed' ? state : 'pending',
            scores: choice.resultsByVoteBalance(),
            scores_by_strategy: choice.resultsByStrategyScore(),
            scores_total: choice.sumOfResultsBalance()
        };

        // Store vp
        if (results.scores_state === 'final') {
            const max = 256;
            const pages = Math.ceil(votes.length / max);
            const votesInPages: any = [];
            Array.from(Array(pages)).forEach((x, i) => {
                votesInPages.push(votes.slice(max * i, max * (i + 1)));
            });

            let i = 0;
            for (const votesInPage of votesInPages) {
                const params: any = [];
                let query2 = '';
                votesInPage.forEach((vote: any) => {
                    query2 += ` UPDATE votes SET vp = ?, vp_by_strategy = ?, vp_state = ? WHERE id = ? AND proposal = ? LIMIT 1;`;
                    params.push(vote.balance);
                    params.push(JSON.stringify(vote.scores));
                    params.push(results.scores_state);
                    params.push(vote.id);
                    params.push(proposalId);
                });
                await db.queryAsync(query2, params);
                if (i) await sleep(200);
                i++;
            }
        }

        // Store scores
        const ts = (Date.now() / 1e3).toFixed();
        const query = `
            UPDATE proposals
            SET scores_state = ?,
            scores = ?,
            scores_by_strategy = ?,
            scores_total = ?,
            scores_updated = ?,
            votes = ?
            WHERE id = ? LIMIT 1;
        `;
        await db.queryAsync(query, [
            results.scores_state,
            JSON.stringify(results.scores),
            JSON.stringify(results.scores_by_strategy),
            results.scores_total,
            ts,
            votes.length,
            proposalId
        ]);
        return results;
    } catch (e) {
        console.log('api scores ex:', e);
        const ts = (Date.now() / 1e3).toFixed();
        const query = `UPDATE proposals SET scores_state = ?, scores_updated = ? WHERE id = ? LIMIT 1;`;
        await db.queryAsync(query, ['invalid', ts, proposalId]);
        return { scores_state: 'invalid' };
    }
}

