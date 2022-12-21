import React, { useState,useEffect } from "react";
import './SendRecord.scss';
//react-redux
import { connect ,useDispatch, useSelector} from 'react-redux';
import { setAccount,setSeed } from '../../store/action';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../UserInfo/UserInfo'
import Dot_IMF from '../../images/dot.png';
import status_s from '../../images/status_s.png';
import status_fail from '../../images/status_fail.png';
import Top from '../../images/router.png';
import { Button ,message} from 'antd';
const { TransferService }  = require("../../store/transfer");
const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
const SendRecord = (props) => {
    const {account,keys} = props
    const [record, setRecord] = useState([])

    const Navigate = useNavigate();
    const outWalletRouter = () => {
    //   console.log(props)
      Navigate('/WalletHome')
    };
    useEffect(() => {
        var indexdb = new TransferService();
        var query = indexdb.getTransfers(account).then(res=>{
            setRecord(res)
    });
    }, []);
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
        <div className="SendRecord" >
            <UserInfo></UserInfo>
            <div className='SendRecord_c'>
            <div className='top_'>
                <img onClick={outWalletRouter} src={Top}></img>
                <span>Record</span>
            </div>
                <div>  
                    
                <ul className='Assets_record'>
                    <li className='title'>
                       <p className='token'>Token</p> 
                       <p className='Amount'>Amount</p> 
                       <p className='Hash'>Hash</p> 
                       <p className='Date'>Date</p> 
                       <p className='Status'>Status</p> 
                    </li>

                    {
                        record.map((item,index)=>{
                        
                        return  <li key={index}>
                        <p className='token'>{item.symbols}</p> 
                        <p className='Amount'>{item.balance}</p> 
                        <p className='Hash' onClick={()=>copyHash(item.hash)}>{item.hash}</p> 
                        <p className='Date'>{new Date(parseInt((item.createTime).getTime())).toLocaleString()}</p> 
                        <p className='Status'><img src={item.status==1?status_s:status_fail}></img></p> 
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
        keys:state.keys
    }
}  
export default connect(mapStateToProps,mapDispatchToProps)(SendRecord)
