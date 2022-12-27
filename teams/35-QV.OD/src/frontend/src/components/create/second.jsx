import styled from "styled-components";
import {Form,FloatingLabel,Button} from "react-bootstrap";
import {useSubstrate} from "../../api/contracts";
import {useState} from "react";

const Box = styled.div`
    padding: 20px;
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
    padding: 20px 0 0;
  font-family: "Poppins-Medium";
  font-size: 24px;
  text-align: left;
`

const InputBox = styled.div`
    margin-top: 40px;

`

const Group = styled.div`
    button{
      width: 100%;
    }
`

export default function Second(){
    const {dispatch} = useSubstrate();
    const [ name,setName] = useState('');

    const handleStep = () =>{
        dispatch({ type: 'STEP', payload: 3 });
        dispatch({ type: 'WALLET_NAME', payload: name });
    }

    const handleInput = (e) =>{
        const { value } = e.target;
        setName(value)

    }

    return <Box>
        <div className="main">
            <div>
                <TitleBox>A descriptive name for your account</TitleBox>
                <InputBox>
                    <FloatingLabel
                        controlId="floatingInput"
                        label="Identity name"
                        className="mb-3"
                    >
                        <Form.Control type="text" placeholder="Identity name" onChange={(e)=>handleInput(e)} value={name}/>
                    </FloatingLabel>

                </InputBox>
            </div>

            <Group>
                <Button variant="flat" onClick={()=>handleStep()} >Next</Button>
            </Group>
        </div>

    </Box>
}