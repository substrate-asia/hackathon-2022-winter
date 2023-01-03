import Layout from "./components/layout/layout";
import styled from "styled-components";
import EmptyImg from "./assets/images/icon_empty.svg";
import RhtImg from "./assets/images/icon_arrow_down.svg";
import CloseImg from "./assets/images/icon_closeWhite.svg";
import {useState} from "react";

const Mask = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Box = styled.div`
    padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  text-align: center;
  color: #666;
  width: 400px;
  height: 400px;
  position: relative;
  background: #1c1d22;
  box-shadow: 2px 0 5px rgb(0 0 0 / 20%);
  border-radius: 4px;

  img{
    width: 150px;
    margin-bottom: 20px;
  }
`

const MainContent = styled.div`
  padding:20px 40px 40px;
`

const TabBox = styled.ul`
    display: flex;
    justify-content: flex-start;
  border-bottom: 2px solid rgba(255,255,255,0.3);
  li{
    font-family: "bold";
    font-size: 22px;
    padding: 10px 20px;
    color: rgba(255,255,255,0.5);
    margin-bottom: -2px;
    cursor: pointer;
    &.active{
      border-bottom: 2px solid #fcca00;
      color: #ffffff;
    }
  }
`

const DlBox = styled.div`
  margin-top: 30px;
  background: #1c1d22;
  box-shadow: 2px 0 5px rgb(0 0 0 / 20%);
  padding: 10px 0;
  border-radius: 4px;
  dl{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 20px;
    padding: 20px 0;
    cursor: pointer;
    border-bottom: 1px dashed rgba(255,255,255,0.2);
    &:last-child{
      border-bottom: 0;
    }
  }
  dt{
    opacity: 0.6;
    font-family: "Lato-Light";
  }
  dd{
  
    display: flex;
    align-items: center;
    img{
      width: 16px;
      margin-left: 10px;
      transform: rotate(-90deg);
      opacity: 0.5;
    }
  }
`
const CloseBox = styled.div`
    position: absolute;
  right: 10px;
  top: 10px;
  z-index: 999;
  cursor: pointer;
  img{
    width: 20px;
  }
`

export default function Setting(){

    const [ show, setShow] = useState(false);

    const handleShow = () =>{
        setShow(true)
        setTimeout(()=>{
            setShow(false)
        },1500)
    }

    const handleClose = () =>{
        setShow(false)
    }

    return <div>
        <Layout>
            {
                show &&<Mask>
                    <Box>
                        <CloseBox onClick={()=>handleClose()}>
                            <img src={CloseImg} alt=""/>
                        </CloseBox>
                        <div>
                            <img src={EmptyImg} alt=""/>
                            <div>Coming soon</div>
                        </div>

                    </Box>
                </Mask>
            }


            <MainContent>
                <TabBox>
                    <li className="active">Settings</li>
                </TabBox>
                <DlBox>
                    <dl onClick={()=>handleShow()}>
                        <dt>Language</dt>
                        <dd>
                            <span>English</span>
                            <img src={RhtImg} alt=""/>
                        </dd>
                    </dl>
                    <dl onClick={()=>handleShow()}>
                        <dt>Appearance</dt>
                        <dd>
                            <span>Follow system settings</span>
                            <img src={RhtImg} alt=""/>
                        </dd>
                    </dl>
                </DlBox>
                <DlBox>
                    <dl onClick={()=>handleShow()}>
                        <dt>Manage your Account</dt>
                        <dd>
                            <img src={RhtImg} alt=""/>
                        </dd>
                    </dl>
                </DlBox>
                <DlBox>
                    <dl onClick={()=>handleShow()}>
                        <dt>Debug Mode</dt>
                        <dd>
                            <img src={RhtImg} alt=""/>
                        </dd>
                    </dl>
                    <dl onClick={()=>handleShow()}>
                        <dt>Privacy Guide</dt>
                        <dd>
                            <img src={RhtImg} alt=""/>
                        </dd>
                    </dl>
                    <dl onClick={()=>handleShow()}>
                        <dt>Security</dt>
                        <dd>
                            <img src={RhtImg} alt=""/>
                        </dd>
                    </dl>
                </DlBox>
            </MainContent>
        </Layout>
    </div>
}