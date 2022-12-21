import React, { useState } from "react";
import './LoginWallet.scss';
//react-redux
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed ,setethAddress, setAddress} from '../../store/action';
import SuperChain from '../SuperChain/SuperChain';
import { useNavigate } from 'react-router-dom';
import Top from '../../images/spile_left.png';
import tabActive from '../../images/tba_active.png';
import { Button, message,Select, Upload,Input } from 'antd';
import Pc from '../../images/pc.png';
import { postWallet, initWallet } from '../../../substrate/walletManager';
import { knownSubstrate } from '../../../substrate/network';
import { Json } from "@polkadot/types";
const { UserService }  = require("../../store/user");
const { TextArea } = Input;
const { Option } = Select;
function LoginWallet(props){
    const { setAccount,setethAddress, dispatch} = props
    const [tabType, setTabType] = useState(true);
    const [filesContent, setFilesContent] = useState('')
    const [fileName, setFileName] = useState('')
    const [passwords, setPasswords] = useState('')
    const [newpasswords, setNewpasswords] = useState('')
    const [seedValue, setSeedValue] = useState('')
    const [loadings, setLoadings] = useState(false);
    
    const Navigate = useNavigate();
    const outWalletRouter = () => {
      Navigate('/Wallet')
    };
    const WalletHomeRouter = () => {
        Navigate('/WalletHome')
      };
    const printFile=(file)=> {
        var reader = new FileReader();
        reader.onload = evt => {
            setFilesContent(evt.target.result);
        };
        reader.readAsText(file);
      };
    const FileProps = {
        name: 'file',
        action: '',
        headers: {
          authorization: 'authorization-text',
        },
      
        onChange(info) {
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
            setFileName(info.file.name);
            printFile(info.file.originFileObj);
          }
        //   if (info.file.status === 'done') {
        //     message.success(`${info.file.name} file uploaded successfully`);
        //   } 
        },
      };
      const PassClick=(e)=>{
        setPasswords(e.target.value);
      }
      const newPassClick=(e)=>{
        setNewpasswords(e.target.value);

      }
      const ConfirmLogin= async()=>{
        setLoadings(true)
        if(!filesContent){
            message.error(`Not upload File!`);
            setLoadings(false)
            return;
        }
        if(!passwords){
            message.error(`Wrong Password！`);
             setLoadings(false)
            return;
        }
        let ps4 = {
            'json':JSON.parse(filesContent),
            'newPass':passwords
          }
          await postWallet(1,'pol.jsonRestore',ps4).then(res=>{
              if(res){
                dispatch(setAccount(JSON.parse(filesContent).address))
                Navigate('/WalletHome')
             }else{
                message.error(`Password mistake！`);
                setLoadings(false)
             }
          });
      
      }
      const CreatWallet = async (genesisHash, name, seed, address, oldpasswd) => {
        const data = {
            genesisHash,
            name,
            seed,
            address,
            oldpasswd,
        };
        await postWallet(1, 'pol.saveAccountsCreate', data).then(res => {
            // console.log(res)
            if (res) {
            Navigate('/WalletHome')            
            }
        });
    }
      const seed=(e)=>{
          console.log(e.target.value)
          setSeedValue(e.target.value)
      }
    const Secret=async()=>{
        var indexdb = new UserService();
        if(!newpasswords){
            message.error(`Wrong Password！`);
            return;
        }
        let ps2={
            mnemonic:seedValue,
          } 
        postWallet(1,'pol.seedCreateAddress',ps2).then(res=>{

            knownSubstrate.map(async (item) => {
                if(item.prefix === 0){
                    const ps3 = {
                        'address':res.address,
                        'prefix':item.prefix
                    }
                    postWallet(1,'pol.formatAddressByChain',ps3).then(async(data)=>{
                        let r = await indexdb.getUser(data);
                        if(r.length === 0){
                            var obj = {
                                address:data,
                                paret:res.address,
                                network:item.network,
                                chainid:item.prefix,
                                symbol:item.symbols[0],
                                rpc:item.rpc,
                                decimas:item.decimals,
                                createTime:new Date(),
                            }
                            indexdb.add(obj);
                        }
                        dispatch(setAccount(res.address))
                        dispatch(setAddress(data));
                        dispatch(setethAddress(res.ethaddress))
                        CreatWallet(item.genesisHash, 'xxx', res.seed,data, newpasswords)
                    });  
                }else if(item.prefix === 1284){
                    let r = await indexdb.getUser(res.ethaddress);
                    if(r.length === 0){
                        var obj = {
                            address:res.ethaddress,
                            paret:res.address,
                            network:item.network,
                            chainid:item.prefix,
                            symbol:item.symbols[0],
                            rpc:item.rpc,
                            decimas:item.decimals,
                            createTime:new Date(),
                        }
                        indexdb.add(obj);
                    }
                }else{
                    const ps3 = {
                        'address':res.address,
                        'prefix':item.prefix
                    }
                    postWallet(1,'pol.formatAddressByChain',ps3).then( async(data) =>{
                        let r = await indexdb.getUser(data);
                        if(r.length === 0){
                            var obj = {
                                address:data,
                                paret:res.address,
                                network:item.network,
                                chainid:item.prefix,
                                symbol:item.symbols[0],
                                rpc:item.rpc,
                                decimas:item.decimals,
                                createTime:new Date(),
                            }
                            indexdb.add(obj);
                        }
                        CreatWallet(item.genesisHash, 'xxx', res.seed,data, newpasswords)
                    });  
                }
            })


            // let genesisHash = '';
            // CreatWallet(genesisHash, 'xxx', res.seed, res.address, newpasswords)
            // dispatch(setAccount(res.address))
            // dispatch(setAddress(res.address))
            // dispatch(setethAddress(res.ethaddress))

        });
    }
    return (
        <div className="LoginWallet" >
            <div className='top_'>
                <img onClick={outWalletRouter} src={Top}></img>
                <span>Login Wallet</span>
            </div>
            <div className='LoginWallet_c'>
                <div className='networks'>
                    <p><img src={Pc}></img><span>Select Networks</span></p>
                    <Select className='select_main' defaultValue="Polkadot">
                        <Option value="jack">Polkadot</Option>
                        <Option value="jack">Meonbeam</Option>

                    </Select>
                </div>

                <ul>
                    <li onClick={()=>{
                        setTabType(true)
                    }}
                    >
                        <div className={tabType?'pointactive':'point'}></div>
                        <span  className={tabType?'active':''} >Secret Phrase</span>
                    </li>
                    <li  onClick={()=>{
                        setTabType(false)
                    }}>
                        <div className={tabType === false?'pointactive':'point'}></div>
                        <span className={!tabType?'active':''} >Keyfile</span>
                    </li>
                </ul>

                <div  className={tabType?'active':'key'}>
                        <TextArea onChange={seed} rows={6}  ></TextArea>
                        <div className='_password'>
                         <span>Enter password</span>
                        <Input type='password'  placeholder='PassWord' onChange={newPassClick}></Input>
                        </div>
                        <div className='Confirm_c'>
                        <Button onClick={outWalletRouter} src={Top} className='Cancel'>Cancel</Button>
                            <Button onClick={Secret} className='Confirm'>Confirm</Button>
                        </div>
                </div>

                <div  className={!tabType?'active':'key'}>
                <div className='Uploads'>
                 <Input disabled placeholder='File Name' value={fileName}></Input>
                <Upload {...FileProps} >
                    <Button className='Upload_B'>Select File</Button>
                </Upload>
                </div>
                <div className='_password'>
                    <span>Enter password</span>
                    <Input type='password'  placeholder='PassWord' onChange={PassClick}></Input>
                </div>
                <div className='Confirm_c'>
                    <Button onClick={outWalletRouter} src={Top} className='Cancel'>Cancel</Button>
                    <Button loading={loadings}  onClick={()=>ConfirmLogin()} className='Confirm' >Confirm</Button>
                </div>
                </div>

            </div>
            <SuperChain></SuperChain>
        </div>

    )
}
const mapDispatchToProps = () => {
    return {
        setAccount,
        setSeed,
        setethAddress
    }
}
export default connect(mapDispatchToProps)(LoginWallet)
