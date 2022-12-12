import React, { useState,useEffect } from "react";
import './RiskRecord.scss';
//react-redux
import { connect ,useDispatch, useSelector} from 'react-redux';
import { setAccount,setSeed } from '../../store/action';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../UserInfo/UserInfo'
import Dot_IMF from '../../images/dot.png';
import status_s from '../../images/status_s.png';
import status_fail from '../../images/status_fail.png';
import point from '../../images/point.png';
import RiskHead from '../../images/risk_head.png';


import risk_moonbean from '../../images/risk_moonbean.png';
import risk_acala from '../../images/risk_acala.png';
import risk_astar from '../../images/risk_astar.png';
import risk_centrifuge from '../../images/risk_centrifuge.png';
import risk_phala from '../../images/risk_phala.png';
import risk_efinity from '../../images/risk_efinity.png';
import risk_kilt from '../../images/risk_kilt.png';
import risk_litentry from '../../images/risk_litentry.png';
import risk_darwinia from '../../images/risk_darwinia.png';
import risk_kylir from '../../images/risk_kylir.png';

import { Button ,message} from 'antd';
const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

const RiskRecord = (props) => {
    const {account,keys} = props
    const [record, setRecord] = useState([])

    const Navigate = useNavigate();
    const RishDetailRouter = () => {
    //   console.log(props)
      Navigate('/RiskDetail')
    };

    const copyHash=(hash)=>{
        let copyContent = hash;
        var input = document.createElement("input");
        input.value = copyContent;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        document.body.removeChild(input);
        message.success('Copy success message');
    }
    return (
        <div className="RiskRecord" >
            <div className='RiskRecord_c'>
                <div className="risk_head"></div>                
                <div>    
                <ul className='Assets_record'>
                    <li className='title line'>
                       <p className='rank'>Rank</p> 
                       <p className='projectname'>Project Name</p> 
                       <p className='score'>Score</p> 
                    </li>

                    <li className="line">
                       <p className='rank'>1</p> 
                       <p className='projectname'><img src={risk_moonbean} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status' onClick={RishDetailRouter}>
                            <img src={point}></img>
                        </p> 
                    </li>

                    <li className="line">
                       <p className='rank'>2</p> 
                       <p className='projectname'><img src={risk_acala} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>

                    <li className="line">
                       <p className='rank'>3</p> 
                       <p className='projectname'><img src={risk_astar} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>

                    <li className="line">
                       <p className='rank'>4</p> 
                       <p className='projectname'><img src={risk_centrifuge} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>
                    <li className="line">
                       <p className='rank'>5</p> 
                       <p className='projectname'><img src={risk_phala} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>
                    <li className="line">
                       <p className='rank'>6</p> 
                       <p className='projectname'><img src={risk_efinity} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>
                    <li className="line">
                       <p className='rank'>7</p> 
                       <p className='projectname'><img src={risk_kilt} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>
                    <li className="line">
                       <p className='rank'>8</p> 
                       <p className='projectname'><img src={risk_litentry} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>
                    <li className="line">
                       <p className='rank'>9</p> 
                       <p className='projectname'><img src={risk_darwinia} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>
                    <li className="line">
                       <p className='rank'>10</p> 
                       <p className='projectname'><img src={risk_kylir} ></img></p> 
                       <p className='score'>98</p> 
                       <p className='Status'>
                            <img src={point} onClick={RishDetailRouter}></img>
                        </p> 
                    </li>

                    {/* {
                        record.map((item,index)=>{
                        
                        return  <li key={index}>
                        <p className='token'>{item.symbols}</p> 
                        <p className='Amount'>{item.balance}</p> 
                        <p className='Hash' onClick={()=>copyHash(item.hash)}>{item.hash}</p> 
                        <p className='Date'>{new Date(parseInt((item.createTime).getTime())).toLocaleString()}</p> 
                        <p className='Status'><img src={item.status==1?status_s:status_fail}></img></p> 
                     </li>
                        })
                    } */}
               
             
                 

                </ul>
                </div>
            </div>

            </div>
    )
}
const mapDispatchToProps= () =>{ 
    return {
        setAccount, setSeed 
    }
}
const mapStateToProps = (state) => {
    return { 
        account: state.account ,
        keys:state.keys,
    }
}  
export default connect(mapStateToProps,mapDispatchToProps)(RiskRecord)
