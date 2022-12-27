import Layout from "./components/layout/layout";
import styled from "styled-components";
import DocImg from "./assets/images/icon_doc.svg";
import RImg from "./assets/images/icon_receipients.svg";
import SendImg from "./assets/images/icon_send.svg";
import UImg from './assets/images/icon_upload.svg';
import BannerRht from "./components/home/banner";
import {useNavigate} from "react-router-dom";

const Box = styled.div`
  width: 100%;
`

const Banner = styled.div`
    display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  position: relative;
`
const TitleBox = styled.div`
  font-family: "black";
  font-size: 45px;
  width: 63%;
  margin: 35px 0 20px;
`

const TipsBox = styled.div`
    font-size: 18px;
  color: #c0c2cd;
  width: 45%;
`

const Wallet = styled.div`
  position: relative;
    display: flex;
  justify-content: center;
  align-items: center;
  background: #fcca00;
  color: #000000;
  padding: 0 20px;
  border-radius: 4px;
  font-family: "Lato-Regular";
  width: 200px;
  margin-top: 40px;
  height: 50px;
  cursor: pointer;
  z-index: 9;
`

const ListBox = styled.div`
    display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 40px;
  margin-top: 40px;
  dl{
    width: 23%;
    background: #1c1d22;
    box-shadow: 2px 0 5px rgb(0 0 0 / 20%);
    padding: 30px 0;
    border-radius: 4px;
    .imgBox{
      margin-bottom: 20px;
      padding: 0 20px;
      img{
        width: 50px;
      }
    }
    dt{
      font-family: "bold";
      font-size: 24px;
      padding: 10px 20px;
      background: linear-gradient(60deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02));
    }
    dd{
      width: 100%;
      font-size: 16px;
      color: #c0c2cd;
      margin-top: 20px;
      min-height: 50px;
      padding: 0 20px;
    }
  }
`

const LftTitle = styled.div`
    position: absolute;
  left: 40px;
  top: 40px;
`


export default function Home(){
    const navigate = useNavigate();

    const toGo = () =>{
        navigate("/new")
    }

    return<Layout>
            <Box>
                <Banner>
                    <LftTitle>
                        <TitleBox>
                            Hi,<br/>Welcome to Designer
                        </TitleBox>
                        <TipsBox>
                            Great to have you onboard! Feel free to explore or get a headstart by following the below steps.
                        </TipsBox>
                        <Wallet onClick={()=>toGo()}>Get Started</Wallet>
                    </LftTitle>
                    <BannerRht />
                </Banner>
                <ListBox>
                    <dl>
                        <div className="imgBox">
                            <img src={UImg} alt=""/>
                        </div>
                        <dt>Upload Contract</dt>
                        <dd>Upload all the contract in .pdf format</dd>
                    </dl>
                    <dl>
                        <div className="imgBox">
                            <img src={RImg} alt=""/>
                        </div>
                        <dt>Manage recipients</dt>
                        <dd>Enter details of all the recipients</dd>
                    </dl>
                    <dl>
                        <div className="imgBox">
                            <img src={DocImg} alt=""/>
                        </div>
                        <dt>Prepare documents</dt>
                        <dd>Assign the signatures and fileds in the document</dd>
                    </dl>
                    <dl>
                        <div className="imgBox">
                            <img src={SendImg} alt=""/>
                        </div>
                        <dt>Review and send</dt>
                        <dd>Do the final review and send the documents</dd>
                    </dl>
                </ListBox>
            </Box>
        </Layout>
}