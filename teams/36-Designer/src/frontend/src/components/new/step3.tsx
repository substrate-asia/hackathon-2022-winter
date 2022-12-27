import styled from "styled-components";
import ViewPdf from "../ViewPdf";

const Box = styled.div`
  margin-top: 40px;
  height: 100vh;
  background: #1c1d22;
`

const Wallet = styled.div`
    display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  color: #fcca00;
  padding: 0 20px;
  border-radius: 4px;
  border: 2px solid #fcca00;
  font-family: "Lato-Regular";
  width: 150px;
  margin-top: 40px;
  height: 46px;
  cursor: pointer;
  &:hover{
    opacity: 0.8;
  }
`
interface Iprops{
    checkStep:Function
    fileUrl:string
}

export default function Step3(props:Iprops){

    const { checkStep,fileUrl } = props;
    const handleNext = () =>{
        checkStep(4)
    }

    return <Box>
        <ViewPdf fileUrl={fileUrl} showNext={true} handleNext={handleNext}/>
        {/*<div>*/}
        {/*    <Wallet onClick={()=>handleNext()}>Next</Wallet>*/}
        {/*</div>*/}
    </Box>
}