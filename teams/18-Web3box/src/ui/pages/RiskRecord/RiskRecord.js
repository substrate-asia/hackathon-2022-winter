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
import tip from '../../images/tip.png';
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

const { list, detail } = require('../../../substrate/risk');
const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

const RiskRecord = (props) => {
    const {account,keys} = props
    const [record, setRecord] = useState([])
    const [chooseProject, setChooseProject] = useState()
    const [chooseScore, setChooseScore] = useState(0);

    const Navigate = useNavigate();
    const RishDetailRouter = (projectName,scoreValue) => {
      setChooseProject(projectName);
      setChooseScore(scoreValue)
      Navigate('/RiskDetail',{state:{id:projectName,score:scoreValue} })
    };

    useEffect(() => {
        list().then(res=>{ 
            setRecord(res.data)
        });
    }, []);

    return (
        <div className="RiskRecord" >
            <div className='RiskRecord_c'>
                <div className="risk_head"></div>                
                <div>    
                <ul className='Assets_record'>
                    <li className='title line'>
                       <p className='rank'>Rank</p> 
                       <p className='projectname'>Project Name</p> 
                       <p className='score'>
                        Score
                        <img src={tip} title='Weekly Update'></img>
                       </p> 
                    </li>

                    {
                        record.map((item,index)=>{
                        
                        return  <li key={index} className='line'>
                        <p className='rank'>{index + 1}</p> 
                        <p className={item.projectName === 'Moonbeam' ? 'projectname':'tokenHidden'}><img src={risk_moonbean} ></img></p> 
                        <p className={item.projectName === 'Acala' ? 'projectname':'tokenHidden'}><img src={risk_acala} ></img></p> 
                        <p className={item.projectName === 'Astar' ? 'projectname':'tokenHidden'}><img src={risk_astar} ></img></p> 
                        <p className={item.projectName === 'Centrifuge' ? 'projectname':'tokenHidden'}><img src={risk_centrifuge} ></img></p> 
                        <p className={item.projectName === 'Phala Network' ? 'projectname':'tokenHidden'}><img src={risk_phala} ></img></p> 
                        <p className={item.projectName === 'Efinity' ? 'projectname':'tokenHidden'}><img src={risk_efinity} ></img></p> 
                        <p className={item.projectName === 'KILT' ? 'projectname':'tokenHidden'}><img src={risk_kilt} ></img></p> 
                        <p className={item.projectName === 'Litentry' ? 'projectname':'tokenHidden'}><img src={risk_litentry} ></img></p> 
                        <p className={item.projectName === 'Darwinia' ? 'projectname':'tokenHidden'}><img src={risk_darwinia} ></img></p> 
                        <p className={item.projectName === 'Kylin' ? 'projectname':'tokenHidden'}><img src={risk_kylir} ></img></p>
                        <p className='score' >{item.score}</p> 
                        <p className='Status' onClick={() => RishDetailRouter(item.projectName,item.score)} >
                            <img src={point}></img>
                        </p>  
                     </li>
                        })
                    }
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
