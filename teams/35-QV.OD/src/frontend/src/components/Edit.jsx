import styled from "styled-components";
import {Button, FloatingLabel, Form} from "react-bootstrap";
import {useState} from "react";
import CloseImg from "../assets/images/icon_close.svg";
import UploadImg from "../assets/images/icon_upload.svg";

const Box = styled.div`
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  textarea{
    resize: none;
  }
  input[type="file"] {
    display: none;
  }
`

const CloseBox = styled.div`
    position: absolute;
  right: -10px;
  top: -10px;
  z-index: 999;
  cursor: pointer;
  img{
    width: 20px;
  }
`
const MidBox = styled.div`
  background: #222;
  padding: 20px;
  border-radius: 8px;
  box-shadow: -5px -5px 20px #00000040;
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const InputBox = styled.div`
    margin-top:10px;
width: 100%;
  label{
    display: inline-block;
    width: 100%;
  }
`

const Group = styled.div`
  margin-top: 20px;
    button{
      width: 100%;
    }
`

const UploadBox = styled.div`
  border: 1px dashed #333;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #2e3134;
  cursor: pointer;
  width: 100%;
  padding: 20px;
  img{
    width: 20px;
    margin-right: 10px;
    opacity: 0.6;
  }
`

const FileS = styled.div`
  padding-top: 10px;
  opacity: 0.5;
  font-size: 12px;
`


const TitleBox = styled.div`
  font-family: "Poppins-Medium";
  font-size: 20px;
  text-align: center;
  position: relative;
  padding-bottom: 20px;
`

export default function Edit(props){
    const {handleClose} = props
    const [ name,setName] = useState('');
    const [ about,setAbout] = useState('');
    const [ fileName,setFileName] = useState('');
    const handleInput = (e) =>{
        const { value,name } = e.target;
        if(name === 'name'){
            setName(value)
        }else{
            setAbout(value)
        }

    }
    const handleSubmit = () =>{
        let obj ={
            name,
            about
        }
        console.log(obj)
        handleClose()
    }

    const updateLogo = (e) =>{
        const { files } = e.target;
        const { name } = files[0];
        setFileName(name)
    }

    return <Box>
        <MidBox>
            <div>
                <TitleBox>Edit  <CloseBox onClick={()=>handleClose()}>
                    <img src={CloseImg} alt=""/>
                </CloseBox></TitleBox>

                 <InputBox>
                        <FloatingLabel
                            controlId="floatingInput"
                            label="Name"
                            className="mb-3"
                        >
                            <Form.Control type="text" name="name" placeholder="Name" onChange={(e)=>handleInput(e)}/>
                        </FloatingLabel>

                    </InputBox>
                    <InputBox>
                        <FloatingLabel
                            controlId="floatingInput2"
                            label="About"
                        >
                            <Form.Control style={{ height: '100px' }}    as="textarea" name="about" placeholder="About" onChange={(e)=>handleInput(e)} />
                        </FloatingLabel>

                    </InputBox>

                    <InputBox>
                        <label htmlFor="file-upload" >
                            <UploadBox>
                                <img src={UploadImg} alt=""/>
                                <span>Upload</span></UploadBox>
                        </label>
                        <input id="file-upload" type="file"  onChange={(e)=>updateLogo(e)}/>
                    </InputBox>

                {
                    fileName &&<FileS>{fileName}</FileS>
                }

            </div>

            <Group>
                <Button variant="flat" onClick={()=>handleSubmit()} >Submit</Button>
            </Group>
        </MidBox>
    </Box>
}