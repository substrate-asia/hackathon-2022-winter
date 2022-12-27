import styled from "styled-components";
import {Button} from "react-bootstrap";
import {useSubstrate} from "../../api/contracts";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import {useEffect} from "react";
import {InitHandler} from "../../api/apiHttp";

const Box = styled.div`
    padding: 20px 0;
  height: 520px;
  box-sizing: border-box;
  .main{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
`

const TitleBox = styled.div`
    padding: 20px;
  font-family: "Poppins-Medium";
  font-size: 24px;
  text-align: left;
`

const InputBox = styled.div`
    background: #2e3134;
  width: 100%;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  span{
    display: inline-block;
    padding:0 20px 10px 0;
    color: #727475;
    font-family: "Poppins-Light";
  }
`

const NameBox = styled.div`
  padding-bottom: 10px;

  .tit{
    color: #727475;
  }
    .name{
      font-family: "Poppins-Light";
      word-break: break-all;
    }
`


const Group = styled.div`
  padding: 0 20px;
    button{
      width: 100%;
    }
`

const MainBox = styled.div`
    padding: 0 20px;
  background: #222;
`

export default function Forth(){
    const {state,dispatch} = useSubstrate();
    const {mnemonic,name,wallet} = state;

    const navigate = useNavigate();


    const download = () =>{
        html2canvas(document.getElementById("downloadBox"), {
            allowTaint: false,
            useCORS: true,
        }).then(function (canvas) {
            // toImage
            const dataImg = new Image()
            dataImg.src = canvas.toDataURL('image/png')
            const alink = document.createElement("a");
            alink.href = dataImg.src;
            const time = (new Date()).valueOf();
            alink.download = `QV-OD_Mnemonic_${time}.jpg`;
            alink.click();

            let obj={
                mnemonic,name,wallet
            }
            localStorage.setItem('info',JSON.stringify(obj));
            dispatch({type:'SET_USERKEY',payload:obj})
            setTimeout(()=>{
                navigate('/list/all');
            },1000)

        });
    }

    const handleStep = () =>{
        download()
        navigate("/list");
    }
    return <Box>
        <div className="main">
            <div>
                <TitleBox>Saved my mnemonic seed safety.</TitleBox>
                <MainBox id="downloadBox">
                    <NameBox>
                        <div  className="tit">Identity name</div>
                        <div className="name">{name}</div>
                    </NameBox>
                    <NameBox>
                        <div  className="tit">Wallet</div>
                        <div className="name">{wallet.address}</div>
                    </NameBox>
                    <InputBox>
                        {
                            mnemonic.map((item,index)=>( <span key={index}>{item}</span>))
                        }
                    </InputBox>
                </MainBox>
            </div>

            <Group>
                <Button variant="flat" onClick={()=>handleStep()} >Download</Button>
            </Group>
        </div>

    </Box>
}