import styled from "styled-components";
import BgImg from "../assets/images/innerBg.jpg"

const InnerBox = styled.div`
  background: url(${BgImg}) ;
  background-size: 100%;
  width: 100%;
  height: 100%;
`
const Mask = styled.div`
  background: rgba(0,0,0,.4);
  background-image: linear-gradient(0deg,rgba(0,0,0,.8) 0,transparent 60%,rgba(0,0,0,.8));
  backdrop-filter: blur(2px);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const MidBox = styled.div`
    text-align: center;
`
const TitleBox = styled.div`
  font-family: "Poppins-SemiBold";
  text-transform: uppercase;
  font-size: 40px;
`

const TipsBox = styled.div`
    text-transform: uppercase;
  background: #4776d3;

  font-size: 20px;
`
const LeftBox = styled.div`
  font-family: "Poppins-Light";
  margin-top: 10px;
`

export default function Bg(){
    return <InnerBox>
            <Mask>
                <MidBox>
                    <TitleBox>Welcome to qv.od</TitleBox>
                    <TipsBox>everything you favorited is here.</TipsBox>
                    <LeftBox>Create new site or follow the site you liked</LeftBox>
                </MidBox>

            </Mask>
    </InnerBox>
}