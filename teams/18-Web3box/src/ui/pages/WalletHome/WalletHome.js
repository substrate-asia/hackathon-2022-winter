import React, { useState, useEffect } from "react";
import './WalletHome.scss';
//react-redux
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed,setAddress,setethAddress,setUserimg } from '../../store/action';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../UserInfo/UserInfo'
import tabActive from '../../images/tba_active.png';
import refresh from '../../images/refresh.png';
import Nft_IMG from '../../images/nft.png';
import Set_IMG from '../../images/set.png';
import { Button, Spin ,message,Pagination} from 'antd';
import { postWallet } from '../../../substrate/walletManager';
import { knownSubstrate } from '../../../substrate/network';
import Dot_IMF from '../../images/dot.png';
import Ksm_Img from '../../images/ksm.png';
import aca_Img from '../../images/aca.png';
import astr_Img from '../../images/astr.png';
import gkmr_Img from '../../images/gkmr.png';
import axios  from 'axios';
import Talisman from '@talismn/api'

const { UserService }  = require("../../store/user");

const handleChange = (value) => {
    console.log(`selected ${value}`);
};
const WalletHome = (props) => {
    const { account, keys, setUserimg ,setAddress,address,ethAddress,setethAddress} = props;
    const [tabType, setTabType] = useState(true);
    const [previousFrees, setPreviousFrees] = useState();
    const [tokenName, setTokenName] = useState();
    const [tokenNumber, setTokenNumber] = useState();
    const [lodingL, setLodingL] = useState(true);
    const [totals, setTotals] = useState(1);

    const [balances, setbalances] = useState([])
    const [record, setRecord] = useState([])
    const Navigate = useNavigate();
    const Recieve_click = (send,address,prefix) => {
        Navigate('/AssetsTabs', { state: { datas: send,ethAddress:ethAddress }, replace: true })
    };
    const RecordBtn = () => {
        Navigate('/sendRecord')
    }
    const setAvatar=(url)=>{
        var obj = {
            address:account,
            img:url,
            createTime:new Date(),
          }
          var indexdb = new UserService();
          var r = indexdb.updateByAddress(account,obj);
          message.success('Avatar changed successfully！');
          setUserimg(url)
    }
    
    const GetBlance = () => {
        knownSubstrate.map(async (item) => {
            if (keys == item.prefix) {
                setTokenName(item.displayName)
                if(keys==1284){
                    const ps2 = {
                        address: ethAddress,
                        chain: item.rpc
                    }
                    setLodingL(true)
                    let { data: { free: previousFree }, nonce: previousNonce } = await postWallet(1, 'pol.balance', ps2)
                    //  console.log(`${previousFree}`)
                    setLodingL(false)
                    setTokenNumber(`${previousFree}`)
                    setPreviousFrees(`${previousFree}` / item.decimals)
                }else{

                const ps2 = {
                    address: account,
                    chain: item.rpc
                }
                //   =
                setLodingL(true)
                let { data: { free: previousFree }, nonce: previousNonce } = await postWallet(1, 'pol.balance', ps2)
                //  console.log(`${previousFree}`)
                setLodingL(false)
                setTokenNumber(`${previousFree}`)
                setPreviousFrees(`${previousFree}` / item.decimals)
                //    })
            }
            }
        })
    
    }
  
    useEffect(() => {
        GetBlance();
    }, [keys])
    return (
        <div className="WalletHome" >
            <UserInfo></UserInfo>
            <div className='LoginWallet_c'>
                <ul className='tabs'>
                    <li>
                        <span className={tabType ? 'active' : ''} >Assets</span>
                    </li>
                    <Button  onClick={RecordBtn} className={tabType ? 'RecordBtn':'key'}>Records</Button>
                </ul>

                <div className={tabType ? 'active' : 'key'}>
                    <ul className='Assets_record'>
                    <div className={lodingL?'Spin_modal':'key'}>
                    <Spin></Spin>
                    </div>
                        <li className='title'>
                            <p>Tokens</p >
                            <p>Amount</p >
                            <p></p >
                        </li>
                        <li>
                            <p className={keys=='0'?'':'tokenHidden'}>< img src={Dot_IMF}></img></p >
                            <p className={keys=='2'?'':'tokenHidden'} >< img src={Ksm_Img}></img></p >
                            <p className={keys=='10'?'':'tokenHidden'} >< img src={aca_Img}></img></p >
                            <p className={keys=='5'?'':'tokenHidden'} >< img src={astr_Img}></img></p >
                            <p className={keys=='1284'?'':'tokenHidden'} >< img src={gkmr_Img}></img></p >
                            <p className={keys=='172'?'':'tokenHidden'} >< img src={Ksm_Img}></img></p >
                            <p>
                                {previousFrees && previousFrees.toFixed(4)}
                                <img onClick={GetBlance} src={refresh} className='refresh'></img>
                            </p >
                            <p>
                                <Button onClick={()=>Recieve_click('1')} className='button'>Receive</Button>
                                <Button onClick={()=>Recieve_click('2')} className='button'>Send</Button>
                            </p >
                        </li>
                    </ul>
                </div>
                

            </div>

        </div>
    )
}
const mapDispatchToProps = (dispatch) => {
    return {
        setUserimg:(url) => dispatch(setUserimg(url)),
        setAccount:(account) => dispatch(setAccount(account)),
        setSeed:(data) => dispatch(setSeed(data)),
        setAddress:(address) => dispatch(setAddress(address)),
    }
}
const mapStateToProps = (state) => {
    return {
        account: state.account,
        keys: state.keys,
        address:state.address,
        ethAddress:state.ethAddress

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WalletHome)