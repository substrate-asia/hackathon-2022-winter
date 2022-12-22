import React, { useState,useEffect } from "react";
import './AssetsTabs.scss';
//react-redux
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed } from '../../store/action';
import { useNavigate,useLocation } from 'react-router-dom';
import { Button ,Select,Input,Modal,message} from 'antd';
import Top from '../../images/router.png';
import UserInfo from '../UserInfo/UserInfo'
import tabActive from '../../images/tba_active.png';
import QR from '../../images/QR.png';
import Loding from '../../images/loding.png';
import Success from '../../images/success.png';
import Error from '../../images/error.png';
import { postWallet } from '../../../substrate/walletManager';
import {knownSubstrate} from '../../../substrate/network';
import QRCode from 'qrcode.react';
import Dot_IMF from '../../images/dot.png';
import Ksm_Img from '../../images/ksm.png';
import aca_Img from '../../images/aca.png';
import astr_Img from '../../images/astr.png';
import gkmr_Img from '../../images/gkmr.png';
import { generateFromString } from 'generate-avatar'
import Talisman from '@talismn/api'
const { Option } = Select;
const { TransferService }  = require("../../store/transfer");
const { UserService }  = require("../../store/user");

const AssetsTab = (props) => {
    const useLocations=useLocation()
    const { account, keys, setUserimg ,setAddress,address,ethAddress,setethAddress} = props;
    const [tabType, setTabType] = useState(true)
    const [userImg, setUserImg] = useState(Dot_IMF);
    const Navigate = useNavigate();
    const outWalletRouter = (props) => {
        Navigate('/WalletHome')
    };

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleLoading, setIsModalVisibleLoading] = useState(false);
    const [tokenAccount, setTokenAccount] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');
    const [passwords, setPasswords] = useState('');
    const [isLoding, setIsLoding] = useState('3');
    const [toeknBalnce, setTokenBalance] = useState(true);
    const [decimal, setDecimal] = useState(true);
    const [depositBalnce, setDepositBalnce] = useState(1);
    const [rpc, setRpc] = useState('');
    const [gasfees, setGasfees] = useState('');
    const [loadings, setLoadings] = useState(false);
    const [tokenName,setTokenName]=useState([])

    const handleChange = async (value) => {
        if(value === 0){
            setUserImg(Dot_IMF) 
        }else if (value === 2){
            setUserImg(Ksm_Img) 
        }else if (value === 10){
            setUserImg(aca_Img) 
        }else if (value === 5){
            setUserImg(astr_Img) 
        }else if (value === 1284){
            setUserImg(gkmr_Img) 
        }else if (value === 172){
            setUserImg(gkmr_Img) 
        }
        GetBlance(value);
    }
    const showModal = async() => {
        setLoadings(true)
        if(toeknBalnce <= depositBalnce  || (toeknBalnce * 1 - tokenAccount * 1) < depositBalnce ){
            setLoadings(false)
            message.error('Minimum account amount must be greater than ' + depositBalnce);
            return;
        }
      
        if(passwords==''){
            message.error('Wrong Password.');
             setLoadings(false)

            return;
        }
        if(tokenAccount==''){
            message.error('Amount not entered.');
             setLoadings(false)

            return;
        }
        if(tokenAddress==''){
            message.error('The Address is not entered.');
             setLoadings(false)

            return;
        }
        // console.log(account)
        // console.log(tokenAccount*decimal)
        // console.log(rpc)

        const ps1={
            from:account,
            to:tokenAddress,
            balance:tokenAccount*decimal+'',
            chain:rpc
        }
       await postWallet(1,'pol.transferFree',ps1).then(res=>{
             setLoadings(false)
             setIsModalVisible(true);
             setGasfees(res)
       }).catch(err=>{
        console.log(err);
        //message.error('Information filling error.');
        setLoadings(false)
        setIsModalVisible(true);
       });
      };    
      const handleCancel = () => {
        setIsModalVisible(false);
      };
      const handleCancelLoading = () => {
        setIsModalVisibleLoading(false);
      };
      const Max=()=>{
        setTokenAccount( ( toeknBalnce*1 ).toFixed(2))
      }
      const AccountToken=(e)=>{
        const { value: inputValue } = e.target;
        const reg = /^-?\d*(\.\d*)?$/;
        if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
        setTokenAccount(e.target.value)
        }else{
            return ;
        }
      }

      const GetBlance =  (value) =>{
        knownSubstrate.map( async(item)=>{
            if(value === 1284 &&  value == item.prefix){
                  const ps2 = {
                    address:useLocations.state.ethAddress,
                    chain:item.rpc
                  }
                  setDecimal(item.decimals);
                  setRpc(item.rpc);
                  setTokenName(item.symbols[0]);
                  let { data: { free: previousFree }, nonce: previousNonce } = await postWallet(1,'pol.balance',ps2);
                  setTokenBalance(`${previousFree}`/item.decimals);
            }else if(value == item.prefix){
                const ps3 = {
                    'address':account,
                    'prefix':item.prefix
                }
                postWallet(1,'pol.formatAddressByChain',ps3).then(async(data)=>{
                      const ps2 = {
                        address:data,
                        chain:item.rpc
                      }
                      setDecimal(item.decimals);
                      setRpc(item.rpc);
                      setTokenName(item.symbols[0]);
                      let { data: { free: previousFree }, nonce: previousNonce } = await postWallet(1,'pol.balance',ps2);
                      setTokenBalance(`${previousFree}`/item.decimals);
                })
            }})
    }

    
    useEffect( () => {
        if(useLocations.state.datas=='1'){
            setTabType(true)
        }else{
            setTabType(false)
        }
        handleChange(keys);
        GetBlance(keys);
    }, [keys])
      const SendToken= async()=>{
        setIsModalVisible(false);
        setIsModalVisibleLoading(true);
        setIsLoding(0);
        console.log()
        // console.log(tokenAccount*decimal)
        const ps2={
            from:account,
            passwd:passwords,
            to:tokenAddress,
            balance:tokenAccount*decimal+'',
            chain:rpc
        }

        if(keys === 1284){
            ps2.from = useLocations.state.ethAddress;
        }
        try{
            const promise =  postWallet(1,'pol.transfer',ps2);
            promise.then((resolve) => {
                var obj = {
                    hash:resolve,
                    from:account,
                    to:tokenAddress,
                    formatFrom:account,
                    balance:tokenAccount*1,
                    symbols:tokenName,
                    status:'1',
                    desc:'',
                    createTime:new Date(),
                }
                if(resolve !== 0 ){
                    var indexdb = new TransferService();
                    var r = indexdb.add(obj);
                    console.log('ruku')
                    GetBlance()
                    setIsLoding(1);
                }else{
                    obj.hash = 'xxx';
                    obj.status = '2';
                    var indexdb = new TransferService();
                    var r = indexdb.add(obj);
                    setIsLoding(2);
                }
             
            })
        }catch(e){
            var obj = {
                hash:'xxx',
                from:account,
                to:tokenAddress,
                formatFrom:account,
                balance:tokenAccount*1,
                symbols:tokenName,
                status:'2',
                desc:'',
                createTime:new Date(),
              }
              var indexdb = new TransferService();
              var r = indexdb.add(obj);
              setIsLoding(2)
        }
      
      }
      const addressChange=(e)=>{
        setTokenAddress(e.target.value)
      }
      const passwordChange=(e)=>{
        setPasswords(e.target.value)

      }
    return (
        <div className="AssetTab" >
            <UserInfo></UserInfo>
            <div className='LoginWallet_c'>
                <div className='top_'>
                    <img onClick={outWalletRouter} src={Top}></img>
                    <span>Assets</span>
                </div>
                <div className='tabsWrap'>

                    <ul>
                        <li onClick={()=>{
                            setTabType(true)
                        }}
                        >
                            <div className={tabType?'pointactive':'point'}></div>
                            <span  className={tabType?'active':''} >Receive</span>
                        </li>
                        <li  onClick={()=>{
                            setTabType(false)
                        }}>
                            <div className={tabType === false?'pointactive':'point'}></div>
                            <span className={!tabType?'active':''} >Send</span>
                        </li>
                    </ul>

                    <div className={tabType ? 'active' : 'key'}>
                        <div className='Recieve'>
                            {/* <img src={QR}></img> */}

                            <img className={keys=='0' ?'':'tokenHidden'} src={Dot_IMF}></img>
                            <img className={keys=='2'?'':'tokenHidden'}  src={Ksm_Img}></img>
                            <img className={keys=='10'?'':'tokenHidden'} src={aca_Img}></img>
                            <img className={keys=='5'?'':'tokenHidden'}  src={astr_Img}></img>
                            <img className={keys=='1284'?'':'tokenHidden'} src={gkmr_Img}></img>
                            <img className={keys=='172'?'':'tokenHidden'} src={gkmr_Img}></img>
                            <div className="QR_CODE">
                            <QRCode value={address} size={170}></QRCode>
                            </div>
                            <p> Your Address </p>
                            <span className='address_'>{address}</span>
                        </div>
                    </div>
                    <div className={!tabType ? 'active' : 'key'}>
                    <div className='Recieve'>

                            <div className='top_'>
                                <img className='avatar' src={userImg}></img>
                                <Select className='select_main' defaultValue={useLocations.state.token} style={{ width: 200 }} onChange={handleChange}>
                                {
                                    knownSubstrate.map(item=>{
                                    return <Option value={item.prefix} key={item.prefix}>{item.symbols[0]}</Option>
                                    })
                                }
                    </Select>
                            </div>
                            <div className='_address'>
                            <Input  onChange={addressChange} placeholder="Enter Address" className='_address_input'></Input>
                            </div>
                            <div className='_Amount'>
                            <Input onChange={AccountToken} value={tokenAccount}  placeholder="Enter Amount"></Input>
                            <Button onClick={Max}>MAX</Button>
                            </div>
                           
                            <div className='_address'>
                            <Input type='password'  onChange={passwordChange} placeholder="Enter Password" className='_address_input'></Input>
                            </div>
                            <p className='balance'> Balance:{toeknBalnce} </p>
                            
                            <Button  onClick={showModal} className='send' loading={loadings} >Send</Button>
                        </div>
                    </div>
                </div>
            </div>
            <Modal wrapClassName='ModalSend' title="Transaction Confirm" width='600px' visible={isModalVisible} onCancel={handleCancel}>
            <p><span>Send：</span> <a>{tokenAddress.slice(0, 4)}****{tokenAddress.slice(tokenAddress.length - 4, tokenAddress.length)}</a></p>
            <p><span>Receive：</span> <a>{tokenAddress}</a></p>
            <p><span>Total amount：</span> <a>{tokenAccount}</a></p>
            {/* <p><span>Transaction  amount：</span> <a>12DOT</a></p> */}
            <p><span>Transaction  Fee：</span> <a>{gasfees}</a></p>
            <div className='modal_footer'>
                <Button onClick={handleCancel} className='Cancel'>Cancel</Button>
                <Button onClick={SendToken} className='Confirm'>Confirm</Button>
            </div>
            </Modal>

            <Modal wrapClassName='ModalSend' title="Transaction Confirmation" width='600px' visible={isModalVisibleLoading} onCancel={handleCancelLoading}>
                    <div className={isLoding==0?'loding madelHide':'loding '}>
                    <img src={Loding}></img>
                    </div>
                    <div className={isLoding==1?'success madelHide':'success '}>
                    <img src={Success}></img>
                    <p>Success !</p>
                    </div>
                    <div className={isLoding==2?'success madelHide':'success '}>
                    <img src={Error}></img>
                    <p> Please try again.</p>
                    </div>

            </Modal>

        </div>
    )
}
const mapDispatchToProps = () => {
    return {
        setAccount, setSeed
    }
}
const mapStateToProps = (state) => {
    return { 
        account: state.account ,
        keys:state.keys,
        address:state.address
    }
}  
export default connect(mapStateToProps,mapDispatchToProps)(AssetsTab)
