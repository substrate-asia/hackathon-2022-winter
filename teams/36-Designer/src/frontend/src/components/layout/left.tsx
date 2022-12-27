import styled from "styled-components";
import {useEffect, useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoImg from "../../assets/images/logo2.png";
import {useSubstrate} from "../../api/connect";
import { ActionType } from "../../utils/types";

const LogoBox = styled.div`
  width: 150px;
  height: 75px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  img{
    width: 160px;
    //height: 45px;
  }
`

const BgBtn = styled.div`
  margin: 60px 0 ;
  height: 54px;
  width: 150px;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
  border-radius: 2px;
  -webkit-animation: animatedgradient 3s ease alternate infinite;
  animation: animatedgradient 3s ease alternate infinite;
  background-size: 300% 300%;
  @-webkit-keyframes animatedgradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  @keyframes animatedgradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`

const UlBox = styled.ul`
  font-family: "Lato-Regular";
    li{
      margin-bottom: 20px;
      &:hover,&.active{
        cursor: pointer;
        color:#fcca00;
      }
    }
`

const NewButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 146px;
  height: 50px;
  background: #000;
  border-radius: 4px;
`

interface navObj {
    name: string;
    value: string;
}

export default function Left(){
    const {state,dispatch} = useSubstrate();
    const navigate = useNavigate();
    const locationUrl = useLocation();
    const [current, setCurrrent] = useState<null|number>(null);

    const [ list ] = useState([
        {
            name: 'Contracts',
            value:"contracts"
        },
        {
            name: 'My Contracts',
            value:"mine"
        },
        {
            name: 'Setting',
            value:"Setting"
        }
    ]);
    useEffect(() => {
        const { pathname } = locationUrl;
        const index = list.findIndex((item) => item.value === pathname.split("/")[1]);
        setCurrrent(index);
    }, [locationUrl.pathname]);


    const handleClick = (item: navObj) => {
        navigate(`/${item.value}`);
    };
    const toGo = (url:string) => {
        navigate(`/${url}`);
    };

    return <div>
        <LogoBox onClick={()=>toGo('')}>
            <img src={LogoImg} alt=""/>
        </LogoBox>
        <BgBtn>
            <NewButton onClick={()=>toGo('new')}>
                New Contract
            </NewButton>
        </BgBtn>
        <UlBox>
            {
                list.map((item,index)=>(<li key={index} onClick={()=>handleClick(item)}  className={current === index ? "active" : ""}>{item.name}</li>))
            }
        </UlBox>
    </div>
}