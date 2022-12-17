import React, { useState, useEffect ,createContext} from "react";
import './RiskDetail.scss';
//react-redux
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed ,setethAddress} from '../../store/action';
import SuperChain from '../SuperChain/SuperChain';
import { useNavigate,useLocation } from 'react-router-dom';
import Top from '../../images/spile_left.png';
import high from '../../images/high.png';
import middle from '../../images/middle.png';
import low from '../../images/low.png';
import rug_pull from '../../images/rug_pull.png'
import attacking from '../../images/attacking.png'
import risky_projects from '../../images/risky_projects.png'
import crash from '../../images/crash.png'


import Warring from '../../images/warring.png';
import CreatWalletFile from '../CreatWalletFile/CreatWalletFile'
import Pc from '../../images/pc.png';
import { Button, Select, message } from 'antd';
const { list, detail } = require('../../../substrate/risk');
const { Option } = Select;
// const {   knownGenesis,handle,cryptoWaitReady } = require('../../api/polkadot');
export const RiskDetailContext = createContext({});

function RiskDetail(props) {
    const params = useLocation();
    const { setAccount,setethAddress, dispatch } = props
    const [record, setRecord] = useState({}) 
  

    const Navigate = useNavigate();
    const outWalletRouter = (props) => {
        Navigate('/RiskRecord')
    };


    useEffect(() => {
        detail(params.state.id).then(res=>{ 
            setRecord(res.data);
        });
    }, []);

    return (
        <div className="RiskDetail" >
            <div className='top_'>
                <img onClick={outWalletRouter} src={Top}></img>
                <span>
                    <p className="mm">{params.state.id}</p>
                    <p className="po">{params.state.score}</p>
                </span>
            </div>

            <div className='RiskDetail_title'>
                <div className='title'>
                    <p>
                        Kylin Network aims to build a cross-chain platform powering the data economy on Polkadot. It will be the data infrastructure for
the future DeFi and Web 3.0 powered by Polkadot. Kylin Network will provide valid, reliable, secure, cost-effective, and
easily-coordinated data sources and data analytics.</p>
                </div>
            </div>


            <div className='risk_report_'>
                <span>Risk Score Report</span>
                <div>
                    <img src={high}></img>
                    <img src={middle}></img>
                    <img src={low}></img>
                </div>
               
            </div>

            <div className='RiskDetail_c'>
                <div className='rug_pull'>
                    <img src={rug_pull}></img>
                </div>

                <ul className='Assets_record'>
                    <li className='line'>
                       <p className='left'>Indicator Type</p> 
                       <p className='right'> Risk Status</p> 
                    </li>

                    <li className="line">
                       <p className='left'>Percentage of Top20 Holders</p> 
                       <p className='right'>
                        <div className={record.wallet_distribution}></div>
                       </p> 
                    </li>

                    <li className="line">
                       <p className='left'>Changes of Whale Wallets </p> 
                       <p className='right'>
                       <div className={record.whale_anomalie_activities}></div>
                       </p> 
                    </li>

                    <li className="line">
                       <p className='left'>Unlocking Token</p> 
                       <p className='right'>
                       <div className={record.locked_period}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Operating Duration</p> 
                       <p className='right'>
                       <div className={record.operation_duration}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Percentage of DEX Transactions</p> 
                       <p className='right'>
                       <div className={record.decentralized_transaction}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Growth Rate of Twitter Followers</p> 
                       <p className='right'>
                       <div className={record.twitter_followers_growthrate}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Growth Rate of Addresses</p> 
                       <p className='right'>
                       <div className={record.address_growthrate}></div>
                       </p> 
                    </li>

                    </ul>


                <div className='rug_pull'>
                    <img src={crash}></img>
                </div>

                <ul className='Assets_record'>
                    <li className='line'>
                       <p className='left'>Indicator Type</p> 
                       <p className='right'> Risk Status</p> 
                    </li>

                    <li className="line">
                       <p className='left'>Token Price </p> 
                       <p className='right'>
                       <div className={record.token_price}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>7-Day Moving Volatility of Token Price Relative to DOT</p> 
                       <p className='right'>
                       <div className={record.token_voltality_overDot}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Growth Rate of 7-Day Moving Average Trading Volume</p> 
                       <p className='right'>
                       <div className={record.week_transaction_growthrate}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Twitter Sentiment Index</p> 
                       <p className='right'>
                       <div className={record.wallet_distribution}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>KOL Comments</p> 
                       <p className='right'>
                       <div className={record.kol_comments}></div>
                       </p> 
                    </li>

                    </ul>

                <div className='rug_pull'>
                    <img src={attacking}></img>
                </div>

                <ul className='Assets_record'>
                    <li className='line'>
                       <p className='left'>Indicator Type</p> 
                       <p className='right'> Risk Status</p> 
                    </li>

                    <li className="line">
                       <p className='left'>Audit Report  </p> 
                       <p className='right'>
                       <div className={record.code_review_report}></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Github Update</p> 
                       <p className='right'>
                       <div className={record.github_update}></div>
                       </p> 
                    </li>

                    </ul>
            </div>
        </div>

    )
}
const mapDispatchToProps = () => {
    return {
        setAccount,
        setethAddress
    }
}
export default connect(mapDispatchToProps)(RiskDetail)
