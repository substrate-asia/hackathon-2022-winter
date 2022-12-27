import {ReactNode, useState} from "react";
import styled from "styled-components";
import { useAccount } from '@gear-js/react-hooks';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import Left from "./left";
import DownImg from "../../assets/images/icon_down_arrow_outline.svg";
import CopyImg from "../../assets/images/icon-copy.svg";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {useNavigate} from "react-router-dom";

const Box = styled.div`
    display: flex;
    align-items: stretch;
  height: 100vh;
`

const LeftBox = styled.div`
    width: 190px;
  box-shadow: 2px 0 5px rgb(0 0 0 / 20%);
  background: #1c1d22;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 15px 0;
  flex-shrink: 0;
`

const RhtBox = styled.div`
    flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`

const RhtHeader = styled.div`
    padding: 15px;
  display: flex;
  justify-content: flex-end;
`
const MainBox = styled.div`
  flex-grow: 1;
`

const Wallet = styled.div`
    display: flex;
  justify-content: center;
  align-items: center;
  background: #fcca00;
  color: #000000;
  padding: 0 20px;
  border-radius: 4px;
  font-family: "Lato-Light";
  height: 40px;
  cursor: pointer;
  margin-left: 10px;
`

const SelectedBox = styled.div`
  background: #21242a url(${DownImg}) no-repeat 90% center;
  background-size: 15px;
  border-radius: 4px;
  padding:10px 20px;
 width: 150px;
  position: relative;

  span{
    display: inline-block;
    width: 100%;
    min-height: 100%;
    cursor: pointer;
  }
  ul{
    position: absolute;
    background: #21242a;
    width: 100%;
    left: 0;
    z-index: 999;
    border-radius: 4px;
    top: 50px;
    li{
      padding: 10px 20px;
      border-bottom: 1px dashed rgba(255,255,255,0.1);
      cursor: pointer;
      &:last-child{
        border-bottom: 0;
      }
      &:hover{
        opacity: 0.8;
      }
    }
  }
`

const CopiedBtn = styled.div`
    width: 50px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fcca00;
  border-radius: 4px;
  margin-left:10px;
  position: relative;
  img{
    width: 24px;
  }
  span{
    position: absolute;
    top: 45px;
    left: 0;
  }
`


interface Props {
    children: ReactNode
}

export default function Layout(props:Props){
    const { children} = props;
    const navigate = useNavigate();
    const [ show,setShow] = useState(false);
    const [ showBox,setShowBox] = useState(false);
    const [ showTips,setShowTips] = useState(false);
    const { switchAccount,accounts,account,logout } = useAccount();

    const handleShow = () =>{
        setShow(true)
    }

    const handleConnect = () =>{
        setShowBox(true)
    }

    const handleSelected =(account: InjectedAccountWithMeta) =>{
        switchAccount(account);
        localStorage.setItem('account', account.address);
        setShow(false);
        window.location.reload();
    }
    const handleLogout =() =>{
        logout()
        localStorage.removeItem('account');
        navigate(`/`)
    }
    const handleCopy = () =>{
        setShowTips(true)
        setTimeout(()=>{
            setShowTips(false)
        },1000)
    }

    return <Box>
        <LeftBox>
            <Left />
        </LeftBox>
        <RhtBox>
            <RhtHeader>
                {
                    (showBox||account) &&<SelectedBox>
                        <span onClick={()=>handleShow()}>{account?.meta.name}</span>
                        {
                            !account&&show&& <ul>
                                {
                                    accounts?.map((item,index)=>( <li onClick={()=>handleSelected(item)} key={index}>{item.meta.name}</li>))
                                }

                            </ul>
                        }

                    </SelectedBox>
                }
                {

                    account && <CopyToClipboard text={account.decodedAddress} onCopy={handleCopy}>
                        <CopiedBtn>
                            <img src={CopyImg} alt=""/>
                            {
                                showTips &&<span>Copied!</span>
                            }

                        </CopiedBtn>
                    </CopyToClipboard>
                }

                {
                    account &&<Wallet onClick={()=>handleLogout()}>Logout</Wallet>
                }
                {
                    !account&&<Wallet onClick={()=>handleConnect()}>Connect Wallet</Wallet>
                }


            </RhtHeader>
            <MainBox>
                {
                    children
                }
            </MainBox>
        </RhtBox>
    </Box>
}