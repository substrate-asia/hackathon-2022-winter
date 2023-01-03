import styled from "styled-components";
import {Button, FloatingLabel, Form} from "react-bootstrap";
import {useState} from "react";
import CloseImg from "../assets/images/icon_close.svg";
import UploadImg from "../assets/images/icon_upload.svg";
import AddImg from "../assets/images/icon_add.svg";
import {useSubstrate} from "../api/contracts";
import {Upload} from "../api/apiHttp";

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

const InputBoxImg =styled(InputBox)`
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #333;
  flex-shrink: 0;
   margin-right: 10px;
  label{
   height: 100px;
  }
  .close{
    position: absolute;
    right: -10px;
    top: -10px;
    cursor: pointer;
    border-radius: 24px;
    width: 24px;
    height: 24px;
    text-align: center;
    background: #333;
    img{
      width: 15px;
    }
  }
  .photo{
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
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
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #2e3134;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 20px;
  img{
    width: 20px;
    margin-right: 10px;
    opacity: 0.6;
  }
`

const UploadBoxImg = styled(UploadBox)`
    height:100px;
  border: 0;
  background: #2e3134;
  img{
    margin-right: 0;
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
const FirstLine = styled.div`
    display: flex;
  align-items: center;
  .tipsBox{
    opacity: 0.3;
    line-height: 1.5em;
    font-size: 14px;
  }
`

export default function New(props){
    const {handleClose,item} = props;
    const {state} = useSubstrate();
    const {info} = state;
    const [ title,setTitle] = useState('');
    const [ about,setAbout] = useState('');
    const [ fileName,setFileName] = useState('');
    const [ imgUrl,setImgUrl] = useState('');
    const [url64,setUrl64] = useState('');
    const [file,setFile] = useState();

    const handleInput = (e) =>{
        const { value,name } = e.target;
        if(name === 'title'){
            setTitle(value)
        }else{
            setAbout(value)
        }

    }
    const handleSubmit = async () =>{
        if(!info)return;
        const infoP = JSON.parse(info)
        const{ wallet:{address}} =infoP;
        handleClose()

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", about);
        formData.append("uploaded_by", address);
        formData.append("cover", url64);
        formData.append("site_id", item.id);

        const res = await Upload(formData);
        console.log(res)

    }


    const getBase64 = (imgUrl) => {
        window.URL = window.URL || window.webkitURL;
        const xhr = new XMLHttpRequest();
        xhr.open("get", imgUrl, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            if (this.status == 200) {
                const blob = this.response;
                console.log("blob", blob)
                let oFileReader = new FileReader();
                oFileReader.onloadend = function (e) {
                    console.log(e.target.result)
                    setUrl64(e.target.result);
                }
                oFileReader.readAsDataURL(blob);
            }
        }
        xhr.send();
    }

    const updateLogo =async (e) =>{
        const { files } = e.target;
        let url = window.URL.createObjectURL(files[0]);
        const base64Url =await getBase64(url);
        console.error(base64Url)
        setImgUrl(url64)
    }
    const updatePDF = (e) =>{
        const { files } = e.target;
        const { name } = files[0];
        setFileName(name)
        setFile(files[0]);
    }

    const removeUrl = () =>{
        setUrl64("")
    }

    return <Box>
        <MidBox>
            <div>
                <TitleBox>New Media <CloseBox onClick={()=>handleClose()}>
                    <img src={CloseImg} alt=""/>
                </CloseBox></TitleBox>
                <FirstLine>
                    <InputBoxImg>
                        {
                            !!url64 && <>
                                <div className="close" onClick={()=>removeUrl()}><img src={CloseImg} alt=""/></div>
                                <img src={url64} alt="" className="photo"/>
                            </>
                        }
                        {
                            !url64 &&<> <label htmlFor="img-upload" >
                                <UploadBoxImg>
                                    <img src={AddImg} alt=""/>
                                </UploadBoxImg>
                            </label>
                                <input type="file" id="img-upload"  onChange={(e)=>updateLogo(e)}/>
                            </>
                        }

                    </InputBoxImg>
                    <div className="tipsBox">
                        <div>Upload cover</div>
                        <div>PNG, JPG, GIF</div>
                    </div>

                </FirstLine>


                <InputBox>
                    <FloatingLabel
                        controlId="floatingInput"
                        label="Title"
                    >
                        <Form.Control type="text" name="title" placeholder="Title" onChange={(e)=>handleInput(e)}/>
                    </FloatingLabel>

                </InputBox>
                <InputBox>
                    <FloatingLabel
                        controlId="floatingInput2"
                        label="Description"
                    >
                        <Form.Control style={{ height: '100px' }}    as="textarea" name="about" placeholder="Description" onChange={(e)=>handleInput(e)} />
                    </FloatingLabel>

                </InputBox>

                <InputBox>
                    <label htmlFor="file-upload" >
                        <UploadBox>
                            <img src={UploadImg} alt=""/>
                            <span>Upload</span></UploadBox>
                    </label>
                    <input id="file-upload" type="file"  onChange={(e)=>updatePDF(e)}/>
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