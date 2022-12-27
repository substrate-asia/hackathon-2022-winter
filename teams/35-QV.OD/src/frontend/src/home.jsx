import styled from "styled-components";
import BgImg from "./assets/images/bg.png";
import {useSubstrate} from "./api/contracts";

import First from "./components/create/first";
import Second from "./components/create/second";
import Third from "./components/create/third";
import Forth from "./components/create/Forth";



const Box = styled.div`
    width: 100vw;
    height: 100vh;
    background: url(${BgImg}) no-repeat center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const BorderBox = styled.div`
  background: #222;
  box-shadow: -5px -5px 20px  rgba(52, 54, 56, 0.8);
  border-radius: 8px;
  flex-shrink: 0;
  margin-right: 10%;
  width: 400px;
  height: 550px;
`




export default function  Home(){

    const {state} = useSubstrate();
    const { step } = state;



    return <Box>
        <BorderBox>
            {
                step === 1 && <First/>
            }
            {
                step === 2 && <Second/>
            }
            {
                step === 3 && <Third/>
            }
            {
                step === 4 && <Forth/>
            }
        </BorderBox>
    </Box>
}