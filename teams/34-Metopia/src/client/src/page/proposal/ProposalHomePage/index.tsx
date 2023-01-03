import { stringToHex } from '@polkadot/util';
import useSize from '@react-hook/size';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { encodeAddress } from '@polkadot/util-crypto';
import parse from 'html-react-parser';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from "react-csv";
import ReactLoading from 'react-loading';
import { MainButton } from '../../../component/button';
import { StandardAvatar } from '../../../component/image';
import { toast, useAlertModal } from '../../../component/modals/AlertModal';
import { useWallet } from '../../../config/redux';
import { localRouter } from '../../../config/urls';
import { useAccountListData } from '../../../core/accountApiHooks';
import { DaoSettings } from '../../../core/dao/type';
import { useDaoById, useProposalById, useProposalScoreData, useScoreData, useVotesData } from '../../../core/governanceApiHooks';
import { sum, toFixedIfNecessary } from '../../../utils/numberUtils';
import { addrShorten, compareIgnoringCase } from '../../../utils/stringUtils';
import { getDateDiff } from '../../../utils/timeUtils';
import { vote } from './functions';
import './index.scss';

const VoteCardRow = (props: { account, vote: { voter, choice }, choices: string[], score, weighted: boolean }) => {
    const { account, vote: v, choices, score, weighted } = props
    return <tr className="vote-card">
        <td style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <StandardAvatar height={32} user={account} className="avatar" />
            <div className='name'><a href={`${localRouter('profile')}${v.voter}`}>{account?.username || addrShorten(encodeAddress(v.voter))}</a></div>
        </td>
        <td className="choice">
            {weighted ?
                choices.filter((t, i) => Object.keys(v.choice).find(j => parseInt(j) == i + 1)).join(', ') :
                choices.filter((t, i) => i + 1 === v.choice)}
        </td>
        <td className="number-wrapper"><span style={{ color: '#E6007A' }}>{score}</span> VP</td>
    </tr>
}

const bitNumberArray = []
if (bitNumberArray.length == 0) {
    let res = 1;
    for (let i = 0; i < 64; i++) {
        bitNumberArray.push(res)
        res *= 2
    }
}

const ProposalHomePage = props => {
    const { id } = props
    const { data: proposal } = useProposalById(id)
    const [selectedOption, setSelectedOption] = useState(-1)
    const [voting, setVoting] = useState(false)
    // const [proposalScores, setProposalScores] = useState(null)
    const [myVote, setMyVote] = useState(null)
    const [selectedSubpage, setSelectedSubpage] = useState(0)

    const [wallet, connect] = useWallet()
    const account = wallet?.address
    const ksmAccount = account && encodeAddress(account, 2)

    // const account = "0x411e07616e24Fed46C647Ef3A6325D4c7d0645eb"
    const { display: alert } = useAlertModal()

    const descriptionBodyRef = useRef(null)
    const [, bodyHeight] = useSize(descriptionBodyRef)
    const realBodyHeight = useMemo(() => {
        return descriptionBodyRef.current == null ? 0 : bodyHeight
    }, [descriptionBodyRef, bodyHeight])
    const { data: votes } = useVotesData(id, account);

    const getAddressToCalcScore = useMemo(() => {
        let res = []
        account && res.push(account)
        votes?.forEach(v => {
            if (!res.includes(v.voter)) {
                res.push(v.voter)
            }
        })
        return res
    }, [account, votes])

    const { data: scores } = useScoreData(proposal?.space?.id, proposal?.snapshot, proposal?.strategies, getAddressToCalcScore)
    const { data: accounts } = useAccountListData(getAddressToCalcScore.map(d => encodeAddress(d)))
    const myAccount = accounts?.list?.find(acc => compareIgnoringCase(acc.owner, account))
    const votingDisabled = proposal?.state === 'closed' || proposal?.state === 'pending' || !scores || !account

    const { data: proposalScores, mutate: mutateProposalScore } = useProposalScoreData(id)
    const doVote = () => {
        if (!account) {
            connect()
            return
        }
        if (voting || votingDisabled)
            return
        if (selectedOption <= 0) {
            alert('Please select at least one option')
            return
        }
        if (!scores[ksmAccount]) {
            alert('Vote failed', 'No voting power')
            return
        }
        let choiceParam = bitNumberArray.reduce((res, v, i) => {
            if (v & selectedOption)
                res[(i + 1).toString()] = 1
            return res
        }, {});

        // let choiceParam = proposal.type == 'single-choice' ?
        //     selectedOption : bitNumberArray.reduce((res, v, i) => {
        //         if (v & selectedOption)
        //             res[(i + 1).toString()] = 1
        //         return res
        //     }, {});
        setVoting(true)

        let msg = {
            "space": proposal.space?.id,
            "type": "vote",
            "proposal": id,
            "choice": true ? parseInt(Object.keys(choiceParam)[0]) : JSON.stringify(choiceParam),
            "metadata": "{}",
            "from": ksmAccount,
            "timestamp": parseInt(new Date().getTime() / 1000 + ''),
        }
        web3FromAddress(wallet.address).then(provider => {
            const signRaw = provider?.signer?.signRaw;
            return signRaw({
                address: wallet.address,
                data: stringToHex(JSON.stringify(msg)),
                type: 'bytes'
            }).then(({ signature }) => {
                let body = {
                    address: ksmAccount,
                    msg,
                    sig: signature
                }
                fetch("https://ai.metopia.xyz/kusama/api/msg", {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*"
                    }
                }).then(r => r.json()).then(d => {
                    if (d != 'ok') {
                        alert('Vote failed', null)
                    }else{
                        toast("You have voted")
                    }
                }).finally(() => {
                    setVoting(false)
                })
            })
        })

        // vote(account, {
        //     "space": proposal.space?.id,
        //     "proposal": id,
        //     "choice": proposal.type == 'single-choice' ? parseInt(Object.keys(choiceParam)[0]) : JSON.stringify(choiceParam),
        //     "metadata": "{}",
        //     "from": account,
        //     "timestamp": parseInt(new Date().getTime() / 1000 + ''),
        // }, null, proposal.type == 'weighted').then(d => {
        //     toast('Voted')
        //     setMyVote({ voter: account, choice: choiceParam })
        //     mutateProposalScore()
        // }).catch(e => {
        //     if (e?.error_description === 'no voting power') {
        //         alert('Vote failed', 'No voting power')
        //     } else
        //         alert('Vote failed', null)
        // }).finally(() => {
        //     setVoting(false)
        // })
    }

    let myChoices = useMemo(() => {
        let result = []
        if (account) {
            if (votes && account) {
                votes.forEach((v) => {
                    if (compareIgnoringCase(account, v.voter)) {
                        if (proposal?.type == 'single-choice') {
                            result.push(v.choice - 1)
                        } else if (proposal?.type == 'weighted') {
                            Object.keys(v.choice).forEach(c => result.push(parseInt(c) - 1))
                        }
                    }
                })
                if (myVote) {
                    if (proposal?.type == 'single-choice') {
                        result.push(myVote.choice - 1)
                    } else if (proposal?.type == 'weighted') {
                        Object.keys(myVote.choice).forEach(c => result.push(parseInt(c) - 1))
                    }
                }
            }
        }
        return result
    }, [proposal, account, votes, myVote])

    useEffect(() => {
        if (proposal?.type == 'weighted' && myChoices?.length && selectedOption == -1) {
            setSelectedOption(myChoices?.reduce((res, index) => {
                return res | bitNumberArray[index]
            }, 0))
        }
    }, [myChoices, selectedOption, proposal])

    const creatorAccount = accounts?.list?.find(acc => compareIgnoringCase(acc.owner, proposal?.author))
    const subpage = useMemo(() => {
        if (selectedSubpage === 0) {
            return <><div className="body RichText" ref={descriptionBodyRef}>{proposal?.body && parse(proposal.body)}</div>
                {
                    realBodyHeight === 0 ?
                        <div className='empty-warning'><img src="https://oss.metopia.xyz/imgs/alert.svg" alt="ALERT" />There is no description for this proposal - a reminder to be cautious of what you are voting for!</div> : null
                }
            </>
        } else {
            return votes?.length || myVote ? <><table className="vote-table">
                <tbody>
                    {
                        myVote ?
                            <VoteCardRow account={myAccount || { owner: account }}
                                choices={proposal?.choices}
                                weighted={proposal?.type == 'weighted'}
                                vote={myVote}
                                score={scores ? scores[account] : 0}
                            />
                            : null
                    }
                    {
                        votes?.filter(v => !compareIgnoringCase(v.voter, myVote ? account : null))?.map((v, i) => {
                            const account = accounts?.list?.find(acc => compareIgnoringCase(encodeAddress(acc.owner), encodeAddress(v.voter)))
                            return <VoteCardRow key={"vote-card" + i}
                                account={account || { owner: v.voter }}
                                choices={proposal?.choices}
                                weighted={proposal?.type == 'weighted'}
                                vote={v}
                                score={scores ? scores[v.voter] : 0}
                            />
                        })
                    }
                </tbody>
            </table>
            </> :
                <div className='empty-warning'><img src="https://oss.metopia.xyz/imgs/alert.svg" alt="ALERT" />There are no votes for this proposal</div>
        }
    }, [realBodyHeight, proposal, votes, myVote, selectedSubpage, accounts, scores, account, myAccount])

    const handleScroll = () => {
        let currentClass = document.getElementById("right-container").className
        if (window.pageYOffset > 64) {
            if (currentClass == "right-container") {
                document.getElementById("right-container").className = "right-container fixed"
            }
            if (document.getElementById("right-container")?.clientHeight + 120 + 320 + window.pageYOffset >= document.getElementById('root').clientHeight - 1) {
                if (currentClass == "right-container fixed") {
                    document.getElementById("right-container").className = "right-container fixed bottomed"
                }
            } else {
                if (currentClass == "right-container fixed bottomed") {
                    document.getElementById("right-container").className = "right-container fixed"
                }
            }
        } else {
            if (currentClass == "right-container fixed" || currentClass == "right-container fixed bottomed")
                document.getElementById("right-container").className = "right-container"
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const rightContainerHeight = document.getElementById("right-container")?.clientHeight

    const { data: daoData } = useDaoById(proposal?.space?.id)
    const daoSettings: DaoSettings = useMemo(() =>
        daoData?.settings ? JSON.parse(daoData.settings) : null
        , [daoData])

    const isAdmin = useMemo(() => {
        return daoSettings?.admins?.find(ad => compareIgnoringCase(ad, account))
    }, [daoSettings, account])
    return <div className="proposal-index-page">
        <div className="title" onClick={() => {
            window.location.href = localRouter("dao.prefix") + (proposal.space?.id)
        }}><img src="https://oss.metopia.xyz/imgs/arrow-left.svg" className="backarrow" alt="back" />Back</div>
        <div className='container' style={{ minHeight: rightContainerHeight + 'px' }}>
            <div className="left-container">
                <div className="title">{proposal?.title}</div>
                <div className='head'>
                    <div className={'status ' + proposal?.state}>{proposal?.state}</div>
                    <div className="author-container">
                        <a href={`${localRouter('profile')}${proposal?.author}`}>
                            <StandardAvatar user={creatorAccount || { owner: proposal?.author }} height={24} className="avatar" />
                            <div className="name">
                                Raised by {creatorAccount?.username || creatorAccount?.owner}
                            </div>
                        </a>
                    </div>
                    <div className="timer">{(() => {
                        if (!proposal) return ""
                        let diff = getDateDiff(proposal.end * 1000, true)
                        if (diff === 'Now') {
                            return 'Closing'
                        } else if (proposal.state === 'closed') {
                            return 'Ended ' + diff + " ago"
                        } else if (proposal.state === 'active') {
                            return diff + ' remaining'
                        } else
                            return 'Starts in ' + diff
                    })()}</div>
                </div>
                <div className='menubar'>
                    <div className={'menu' + (selectedSubpage === 0 ? ' selected' : '')}
                        onClick={() => setSelectedSubpage(0)}>Description</div>
                    <div className={'menu' + (selectedSubpage === 1 ? ' selected' : '')}
                        onClick={() => setSelectedSubpage(1)}>Votes {proposal?.votes ? `(${proposal?.votes})` : ''}</div>
                    {
                        isAdmin || true ? <CSVLink className="vote-exporter-link" filename={moment().format() + ".csv"} data={votes?.map((v, i) => {
                            const accountData = accounts?.list?.find(acc => compareIgnoringCase(acc.owner, v.voter))
                            return {
                                user: v.voter,
                                username: accountData?.username || v.voter,
                                choice: proposal?.choices[v.choice - 1],
                                vp: scores ? scores[v.voter] : 0 || 0,
                                date: moment(v.created * 1000).format()
                            }
                        }) || []} onClick={e => {
                            if (!votes?.length) {
                                alert('There are no votes for this proposal')
                                return false
                            }
                        }}>
                            <img src="https://oss.metopia.xyz/imgs/export.svg" title="Export voting results" className="vote-exporter" alt="" />
                        </CSVLink>
                            : null
                    }

                </div>
                <div className="main-container">
                    {subpage}
                </div>
            </div>
            <div className="right-container-wrapper" >
                <div className="right-container" id="right-container">
                    <div className="voting-container">
                        <div className='title'>Cast votes</div>
                        <div className={'choice-option-wrapper'}>
                            {
                                proposal?.choices.map((c, i) => {
                                    return <div key={`choice-option-${i}`}
                                        className={'choice-option ' + ((selectedOption > -1 ? selectedOption & bitNumberArray[i] : false) ||
                                            (selectedOption == -1 && myChoices?.filter(c => c == i)?.length) ? 'selected' : '') +
                                            (votingDisabled ? ' disabled' : '')}
                                        onClick={() => {
                                            if (votingDisabled)
                                                return
                                            let tmp = selectedOption == -1 ? 0 : selectedOption
                                            if (tmp & bitNumberArray[i]) {
                                                setSelectedOption(tmp & ~bitNumberArray[i])
                                            } else {
                                                if (proposal.type == 'weighted') {
                                                    setSelectedOption(tmp | bitNumberArray[i])
                                                }
                                                else {
                                                    setSelectedOption(bitNumberArray[i])
                                                }

                                            }
                                        }}>
                                        {c}
                                    </div>
                                })
                            }
                        </div>
                        <MainButton
                            disabled={votingDisabled}
                            onClick={doVote}>
                            {voting ? <ReactLoading type='spokes' height={20} width={20} className="loading" /> :
                                (proposal?.state === 'closed' ? 'Closed' : (proposal?.state === 'pending' ? 'Upcoming' : 'Vote'))}
                        </MainButton>
                    </div>

                    <div className="result-container" >
                        <div className='title'>Current result</div>
                        <div className='choice-option-result-container'>
                            {
                                proposal?.choices.map((c, i) => {
                                    return <div key={`choice-option-${i}`} className={'choice-option'}>
                                        <div className="head">
                                            <div className='text'>{c}</div>
                                            <div className='score'>
                                                <div className='total'>{toFixedIfNecessary((proposalScores || proposal.scores)[i], 1)}</div>
                                                <div className='symbol'>/</div>
                                                <div className='percent'>{sum((proposalScores || proposal.scores)) ?
                                                    toFixedIfNecessary((proposalScores || proposal.scores)[i] / sum((proposalScores || proposal.scores)) * 100, 2) :
                                                    0}</div>
                                                <div className='symbol'>%</div>
                                            </div>
                                        </div>
                                        <div className='progress-bar'>
                                            <div className="bg" style={{ width: Math.max((proposalScores || proposal.scores)[i] / sum((proposalScores || proposal.scores)), 0.01) * 100 + "%" }}></div>
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
}

export default ProposalHomePage