import ButtonAccount from "../../Button";
import styled from "styled-components";
import {useSubstrate} from "../../api/contracts";
import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import LogoImg from "../../assets/images/logo.png";

const MainContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const TitleBox = styled.div`
    padding: 40px 20px 0;
  font-family: "Poppins-Medium";
  font-size: 24px;
  text-align: center;
  img{
    height: 25px;
  }
`

const Desc = styled.div`
    opacity: 0.6;
  padding: 20px;
  font-size: 12px;
`
const BtnBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;
`

const GroupBox = styled.div`
    display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 20px;
  button{
    width: 48%;
    height: 40px;
    font-size: 14px;
  }
`

export default function First(){
    const {dispatch} = useSubstrate();
    const [show,setShow] = useState(true);
    const navigate = useNavigate();

    useEffect(()=>{
        let obj = localStorage.getItem("info");

        setShow(!obj)
    },[]);
    const handleStep = () =>{
        dispatch({ type: 'STEP', payload: 2 });
    }

    const handleList = () =>{
        navigate('/list');
    }


    return <MainContent>
            <div>
                {/*<TitleBox>Welcome To QV.od</TitleBox>*/}
                <TitleBox>Welcome To <img src={LogoImg} alt=""/></TitleBox>
                <Desc>In order to make you have a better experience, improve our services or other purposes you agree, on the premise of complying with relevant laws and regulations, we may use the information collected through a service for our other services in a way of collecting information or personalization. </Desc>

            </div>
            <BtnBox>
                {
                    show && <ButtonAccount/>
                }

                {
                    !show && <GroupBox >
                        <Button onClick={()=>handleList()}>To Mine</Button>
                        <Button variant="flat" onClick={()=>handleStep()}>Create Account</Button>
                    </GroupBox>
                }
            </BtnBox>
        </MainContent>

}