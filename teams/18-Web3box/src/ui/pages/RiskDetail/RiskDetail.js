import React, { useState, useEffect ,createContext} from "react";
import './RiskDetail.scss';
//react-redux
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed ,setethAddress} from '../../store/action';
import SuperChain from '../SuperChain/SuperChain';
import { useNavigate } from 'react-router-dom';
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
const { Option } = Select;
// const {   knownGenesis,handle,cryptoWaitReady } = require('../../api/polkadot');
export const RiskDetailContext = createContext({});

function RiskDetail(props) {
    const { setAccount,setethAddress, dispatch } = props
    const Navigate = useNavigate();
    const outWalletRouter = (props) => {
        console.log(props)
        Navigate('/RiskRecord')
    };

    return (
        <div className="RiskDetail" >
            <div className='top_'>
                <img onClick={outWalletRouter} src={Top}></img>
                <span>
                    <p className="mm">Kylin Network Score</p>
                    <p className="po">79</p>
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
                       <p className='left'>Major holders' wallet assets distribution</p> 
                       <p className='right'>
                        <div className="red"></div>
                       </p> 
                    </li>

                    <li className="line">
                       <p className='left'>Market Cap</p> 
                       <p className='right'>
                        <div className="yerrow"></div>
                       </p> 
                    </li>

                    <li className="line">
                       <p className='left'>Twitter followers increasing rate</p> 
                       <p className='right'>
                        <div className="green"></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>GitHub updating rate</p> 
                       <p className='right'>
                        <div className="green"></div>
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
                       <p className='left'>Audit Report </p> 
                       <p className='right'>
                        <div className="red"></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Security Vulnerability</p> 
                       <p className='right'>
                        <div className="yerrow"></div>
                       </p> 
                    </li>

                    </ul>

                <div className='rug_pull'>
                    <img src={risky_projects}></img>
                </div>

                <ul className='Assets_record'>
                    <li className='line'>
                       <p className='left'>Indicator Type</p> 
                       <p className='right'> Risk Status</p> 
                    </li>

                    <li className="line">
                       <p className='left'>Investment and financing report </p> 
                       <p className='right'>
                        <div className="red"></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>Cooperations with other projects </p> 
                       <p className='right'>
                        <div className="yerrow"></div>
                       </p> 
                    </li>

                    </ul>



                    <div className='rug_pull'>
                    <img src={crash}></img>
                </div>

                <ul className='Assets_record '>
                    <li className='line'>
                       <p className='left'>Indicator Type</p> 
                       <p className='right'> Risk Status</p> 
                    </li>

                    <li className="line">
                       <p className='left'>Token price volatility</p> 
                       <p className='right'>
                        <div className="red"></div>
                       </p> 
                    </li>

                    <li className="line">
                       <p className='left'>Rate of change in transactions volume </p> 
                       <p className='right'>
                        <div className="red"></div>
                       </p> 
                    </li>

                    <li className="line">
                       <p className='left'>Token price volatility </p> 
                       <p className='right'>
                        <div className="yerrow"></div>
                       </p> 
                    </li>

                    <li className="">
                       <p className='left'>User sentiment index</p> 
                       <p className='right'>
                        <div className="green"></div>
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
