import { web3FromAddress } from '@polkadot/extension-dapp';
import { stringToHex } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
import $ from 'jquery';
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { arabToRoman } from 'roman-numbers';
import { MainButton } from '../../../component/button';
import { Input, Label } from '../../../component/form';
import OptionSwitcher from '../../../component/form/OptionSwitcher';
import TipTap from '../../../component/form/richtext/TipTap';
import { useAlertModal } from '../../../component/modals/AlertModal';
import { useLoadingModal } from '../../../component/modals/LoadingModal';
import { useWallet } from '../../../config/redux';

import { localRouter, snapshotApi } from '../../../config/urls';
import { DaoSettings } from '../../../core/dao/type';
import './index.scss';

const CreateProposalPage = props => {
    const { dao } = props
    const [body, setBody] = useState("")
    const defaultOptions = [{ id: 0, text: "For" }, { id: 1, text: "Against" }, { id: 2, text: "Abstain" }]
    const [options, setOptions] = useState(defaultOptions)

    const [daoSettings, setDaoSettings] = useState<DaoSettings>()
    const [start, setStart] = useState(moment())
    const [end, setEnd] = useState(moment())

    const [wallet, connect] = useWallet()
    const [account, chainId] = [wallet?.address, '0xzzzz']
    const ksmAccount = account && encodeAddress(account, 2)

    const [now, setNow] = useState(null)

    const { display: alert } = useAlertModal()
    const [type, setType] = useState("single-choice")
    const [snapshot, setSnapshot] = useState(null)
    const { display: loading, hide: unloading } = useLoadingModal()
    useEffect(() => {
        $('.MainContainer').css({ 'overflow-y': 'hidden' })
        return () => {
            $('.MainContainer').css({ 'overflow-y': 'auto' })
        }
    })

    const addOption = useCallback(() => {
        let maxId = 0
        options.forEach(o => { if (o.id > maxId) maxId = o.id })
        let tmp = [...options, { id: maxId + 1, text: '' }]
        setOptions(tmp)
    }, [options])

    const removeOption = useCallback((id) => {
        let tmp = options.filter(o => o.id !== id)
        setOptions(tmp)
    }, [options])

    let optionJsx = useMemo(() => {
        return options.map((op, i) => {
            return <div className="option-card" key={'optioncard' + i} >
                <div className='input-wrapper'>
                    <div className='index'>Option {arabToRoman(i + 1)}</div>
                    <Input key={"option" + op.id} placeholder={"Option " + arabToRoman(i + 1)}
                        onChange={(e) => {
                            let tmp = options.find(t => t.id === op.id)
                            tmp.text = e.target.value
                            setOptions(options.map(o => o))
                        }} value={options.find(t => t.id === op.id).text} />
                </div>
                <img className="Button" src="https://oss.metopia.xyz/imgs/plus-icon-round.svg" alt="Add" onClick={addOption} />
                <img className="Button" src="https://oss.metopia.xyz/imgs/subtract-icon-round.svg" alt="Delete" style={options?.length > 1 ? null : { display: 'none' }}
                    onClick={() => removeOption(op.id)}
                />
                {/* <img src="https://oss.metopia.xyz/imgs/close.svg" alt="remove" className='remove-button' onClick={() => removeOption(op.id)} /> */}
            </div>
        })
    }, [options, removeOption, addOption])

    useEffect(() => {
        if (!dao)
            return
        fetch(snapshotApi.space_selectById + "/?id=" + encodeURIComponent(dao), {
        }).then(d => {
            return d.json()
        }).then(d => {
            if (d.content && d.content.settings) {
                setDaoSettings(JSON.parse(d.content.settings))
                let delay = parseInt(JSON.parse(d.content.settings).voting?.delay || 0)
                let period = parseInt(JSON.parse(d.content.settings).voting?.period || 0)
                let tmp = moment()
                setNow(tmp)
                setStart(moment(tmp).add(delay, 'seconds'))
                setEnd(moment(tmp).add(delay + (period || 3600), 'seconds'))
            }
        })
    }, [dao])

    const delay = daoSettings?.voting?.delay || 0
    const period = daoSettings?.voting?.period || 0

    const createProposal = async (cb) => {
        if (!account) {
            connect()
            return
        }
        let tmpErrors = null
        let timestamp = now.unix(),
            startUnix = start.unix(),
            endUnix = end.unix()
        let spaceChainId = '-2'

        let title = (document.getElementById("proposaltitleinput") as HTMLInputElement).value
        if (!title?.length)
            tmpErrors = { title: 'Title cannot be empty' }
        if (options.length < 1) {
            tmpErrors = { title: 'Options cannot be empty' }
        }
        if (startUnix >= endUnix) {
            tmpErrors = { title: 'Please provide correct duration' }
        }
        if (tmpErrors && Object.keys(tmpErrors).length) {
            alert("Creation failed", tmpErrors[Object.keys(tmpErrors)[0]])
            return
        }

        /**
         * Use ksm address to sign
         */
        let msg = {
            "space": dao,
            "type": type,
            "title": title,
            "body": body,
            "choices": options.map(o => o.text),
            "start": startUnix,
            "end": endUnix,
            "snapshot": snapshot || 0,
            "network": 0,
            "strategies": JSON.stringify(daoSettings.strategies),
            "plugins": "{}",
            "metadata": JSON.stringify({ network: parseInt(spaceChainId).toString() }),
            // "from": account,
            "from": ksmAccount,
            "timestamp": timestamp,
        }
        web3FromAddress(wallet.address).then(provider => {
            const signRaw = provider?.signer?.signRaw;
            return signRaw({
                address: wallet.address,
                data: stringToHex(JSON.stringify(msg)),
                type: 'bytes'
            }).then(({ signature }) => {
                let body = {
                    // address: account,
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
                }).then(r => r.json()).then((d) => {
                    if (d=='ok') {
                        window.location.href = localRouter("dao.prefix") + dao
                    } else {
                        if (d.error_description === 'failed to check validation') {
                            alert("Creation failed", 'You are not authorized to create the proposal')
                        } else if (d.error.indexOf('unauthorized') > -1) {
                            alert("Creation failed", 'You are not authorized to create the proposal')
                        } else
                            alert("Creation failed", null)
                    }
                })
            })
        })
        // let blocknumber = await provider.getBlockNumber()

        // return signTypedData({
        //     "space": dao,
        //     "type": type,
        //     "title": title,
        //     "body": body,
        //     "choices": options.map(o => o.text),
        //     "start": startUnix,
        //     "end": endUnix,
        //     "snapshot": snapshot || 0,
        //     "network": parseInt(spaceChainId).toString(),
        //     "strategies": JSON.stringify(daoSettings.strategies),
        //     "plugins": "{}",
        //     "metadata": JSON.stringify({ network: parseInt(spaceChainId).toString() }),
        //     "from": account,
        //     "timestamp": timestamp,
        // }, proposalTypes, domain, getProvider(wallet).getSigner()).then(res => {
        //     return fetch(snapshotApi.msg, {
        //         method: "POST",
        //         body: JSON.stringify(res),
        //         headers: {
        //             "Content-Type": "application/json",
        //             "Accept": "*/*"
        //         }
        //     }).then(r => r.json()).then(cb)
        // })
    }

    return <div className="create-proposal-page">
        <div className="head">
            <a className='back-button' onClick={() => {
                window.location.href = localRouter('dao', { dao: dao })
            }}><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></a>
            <div className='title'>Create new proposal</div>
        </div>
        <div className="body" >
            <div className="form">
                <Label >{"Title & Description"}</Label>
                <div className="editor-wrapper RichText">
                    <Input placeholder={"Please enter the title of your proposal"} id="proposaltitleinput" autoComplete="off" />
                    <TipTap onChange={setBody} />
                </div>
                <div className='time-container'>
                    <div className='r-label'>Duration</div>
                    <div className='time-input-group-wrapper'>
                        <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                            return <div className='time-input-wrapper'>
                                <input {...props} className="r-input" placeholder={"Start time"}
                                    onChange={e => false} />
                                <img src="https://oss.metopia.xyz/imgs/calendar.svg" alt="" className='calendar-icon' />
                            </div>
                        }} isValidDate={(currentDate, selectedDate) => {
                            return !currentDate?.isBefore(moment(moment(now).add(delay, 'seconds').format('YYYY-MM-DD')))
                        }} onChange={d => {
                            setStart(moment(d))
                            let endLimit = moment(d).add(delay + period, 'seconds')
                            if (end.isBefore(endLimit)) {
                                setEnd(endLimit)
                            }
                        }} value={start} inputProps={{ disabled: delay !== null && delay > 0 }} />

                        <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                            return <div className='time-input-wrapper'>
                                <input {...props} className="r-input" placeholder={"End time"}
                                    onChange={e => false} />
                                <img src="https://oss.metopia.xyz/imgs/calendar.svg" alt="" className='calendar-icon' />
                            </div>
                        }} isValidDate={(currentDate, selectedDate) => {
                            return !currentDate?.isBefore(moment(moment(start).add(delay + period, 'seconds').format('YYYY-MM-DD')))
                        }} value={end} onChange={d => setEnd(moment(d))} inputProps={{ disabled: period !== null && period > 0 }} />
                    </div>
                </div>

                <div className="form-group option" style={{ marginTop: '50px' }}>
                    <Label>Options</Label>
                    {/* <div className={'multiple-trigger-group' + (type == 'weighted' ? ' checked' : "")}>
                        <div className='text'>Multi-choice</div>
                        <OptionSwitcher onChange={e => {
                            if (e) {
                                setType("weighted")
                                if (options[0].text == 'For' && options[1].text == "Against" && options[2].text == "Abstain") {
                                    setOptions([{ id: 0, text: "" }])
                                }
                            } else {
                                setType("single-choice")
                            }
                        }} checked={type == 'weighted'} className="" />
                    </div> */}
                    {optionJsx}
                </div>
            </div>
        </div>
        <div className='footer'>
            <MainButton onClick={() => {
                return createProposal((d) => {
                    if (d.id) {
                        window.location.href = localRouter("dao.prefix") + dao
                    } else {
                        if (d.error_description === 'failed to check validation') {
                            alert("Creation failed", 'You are not authorized to create the proposal')
                        } else if (d.error.indexOf('unauthorized') > -1) {
                            alert("Creation failed", 'You are not authorized to create the proposal')
                        } else
                            alert("Creation failed", null)
                    }

                })
            }}>Publish</MainButton>
        </div>
    </div >
}

export default CreateProposalPage