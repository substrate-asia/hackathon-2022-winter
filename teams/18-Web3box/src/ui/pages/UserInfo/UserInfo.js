import React, { useState,useEffect } from "react";
import './UserInfo.scss';
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed,setAddress,setethAddress } from '../../store/action';
import { useNavigate } from 'react-router-dom';
import Top from '../../images/QR.png';
import File from '../../images/file.png';
import not from '../../images/not.png';
import logout from '../../images/logout.png';
import upload from '../../images/upload.png';
import { Button, Select, message, Input } from 'antd';
import closeUrl from '../../images/close.png';
import keyDowload from '../../images/keyDowload.png';
import { postWallet } from '../../../substrate/walletManager';
import {knownSubstrate} from '../../../substrate/network'
import { generateFromString } from 'generate-avatar'
import { isHex, isU8a, u8aToHex, u8aToU8a } from '@polkadot/util';
const { UserService }  = require("../../store/user");
const { Option } = Select;

const UserInfo = (props) => {
    // console.log(knownSubstrate)
    const { account, setAccount,setSeed,seed ,setAddress,address,keys,url,ethAddress,setethAddress} = props;
    const Navigate = useNavigate();
    const [tabType, setTabType] = useState(false);
    const [passFILE, setPassFILE] = useState(false);
    const [passType, setPassType] = useState(false);
    const [userImg, setUserImg] = useState('');

    
    const copyAddress = () => {
        let copyContent = address;
        var input = document.createElement("input");
        input.value = copyContent;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        document.body.removeChild(input);
        message.success('Successfully copied Address.');
    };
    const logoutModal = () => {
        setTabType(true)
        setPassType(false);
    };
    const exportModal = () => {
        setPassType(true)
        setTabType(false);
    };
    const colseLogout = () => {
        setTabType(false);
        setPassType(false);
    };
    const logoutConfirm = () => {
        setAccount('');
        setAddress('');
        setethAddress('');
        setSeed('');
        Navigate('/Wallet')
    };
    const PASS_FILE =(e)=>{
        setPassFILE(e.target.value)
    }
    const exportConfirm=async()=>{
        const ps2 = {
            'address':account,
            'newPass':passFILE
          }
         await postWallet(1,'pol.accountsExport',ps2).then(res=>{
          funDownload(JSON.stringify(res), `${account}.json`);
            setPassType(false);
        }).catch(res=>{
        message.error('Wrong Password!');
        });
    }
    const funDownload = (content, filename) => {
        var eleLink = document.createElement("a");
        eleLink.download = filename;
        eleLink.style.display = "none";
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    };
    const handleChange = async (value) => {
        const ps3 = {
            'address':account,
            'prefix':value
          }
        await postWallet(1,'pol.formatAddressByChain',ps3).then(res=>{
            if(value==1284){
                setSeed(value);
                setAddress(ethAddress);
            }else{
                setSeed(value);
                setAddress(res);
            }
         
          });    
    }
    useEffect(()=>{
        var indexdb = new UserService();
            indexdb.getUser(account).then(res=>{
                if(res.length != 0){
                    setUserImg(res[0].img)
                    return;
                }
                var obj = {
                    address:account,
                    img:`data:image/svg+xml;utf8,${generateFromString("example@test.com")}`,
                    createTime:new Date(),
                }
                var indexdb = new UserService();
                indexdb.add(obj);
            });
       
 
      },[url])
    return (
        <div className="UserInfo" >
            <div className='user_wallet'>
                <img className='avatar' src={userImg?userImg:`data:image/svg+xml;utf8,${generateFromString("example@test.com")}`}></img>
                <div className='address_ehem'>
                    <Select className='select_main' defaultValue={seed?seed:knownSubstrate[0].prefix} style={{ width: 200 }} onChange={handleChange}>
                       {
                           knownSubstrate.map(item=>{
                           return <Option value={item.prefix} key={item.prefix}>{item.displayName}</Option>
                           })
                       }
                        {/* <Option value="Polkadot">Polkadot</Option>
                        <Option value="Meonbeam">Meonbeam</Option> */}
                    </Select>
                    <p>Address：
                    <span>{address?address.slice(0, 4):account.slice(0, 4)}</span>
                    *****
                    <span>{address?address.slice(address.length - 4, address.length):account.slice(account.length - 4, account.length)}</span>
                    <img onClick={copyAddress} src={File}></img></p>
                </div>
                <div className='not'>
                    <div className='upload'>
                        <img onClick={exportModal} src={upload}></img>
                        <div className={passType ? 'upload-c active_b' : 'upload-c'}>
                            <h6 onClick={colseLogout}><img src={closeUrl}></img></h6>
                                <p>
                                    <Input type='password' onChange={PASS_FILE} placeholder="Password"/>
                                </p>
                                <div className='dowLoad'>
                                    <Input  placeholder="Download Keyfile" disabled/>
                                    <img src={keyDowload}></img>
                                </div>
                                <a>Note: Keep your keyfile and password safe.</a>
                                <div className='Confirm_c'>
                                    <Button onClick={exportConfirm} className='Confirm'>Confirm</Button>
                                </div>
                        </div>
                    </div>
                    <div className='logOut'>
                        <img onClick={logoutModal} src={logout}></img>
                        <div className={tabType ? 'logOut-c active_b' : 'logOut-c'}>
                            <h6 onClick={colseLogout}><img src={closeUrl}></img></h6>
                            <p>Are you sure <br></br>
                                to log out wallet?</p>
                            <div className='Confirm_c'>
                                {/* <Button onClick={logoutModal} className='Cancel'>Cancel</Button> */}
                                <Button onClick={logoutConfirm} className='Confirm'>Confirm</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            )
}
const mapDispatchToProps = (dispatch) => { 
   return {
    setAccount:(account) => dispatch(setAccount(account)),
    setSeed:(data) => dispatch(setSeed(data)),
    setAddress:(address) => dispatch(setAddress(address)),
    setethAddress:(ethAddress) => dispatch(setethAddress(ethAddress))
    }
}
const mapStateToProps = (state) => {
    return { 
        account: state.account ,
        seed:state.seed,
        address:state.address,
        keys:state.keys,
        userimags:state.userimags,
        url:state.url,
        ethAddress:state.ethAddress
    }
}  
export default  connect(mapStateToProps,mapDispatchToProps)(UserInfo)
