import styled from "styled-components";
import {useState,useEffect} from "react";
import {useAccount, useSendMessage} from "@gear-js/react-hooks";
import AddImg from "../assets/images/add.svg";
import {useSubstrate} from "../api/connect";
import {ActionType} from "../utils/types";
import FinishedImg from "../assets/images/hand.svg";
import PenImg from "../assets/images/icon_pen.svg";
import {ADDRESS} from "../consts";
import {Hex} from "@gear-js/api";
import {useNavigate} from "react-router-dom";
import {ApiLoader} from "./loaders";

const Box = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
`

const MaskBox = styled.div`
    width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #000;
  z-index: 19;
`


const IframeBox = styled.div`
flex-grow: 1;
  iframe{
    width: 100%;
    height: 100vh;
    border: 0;
  }
`
const RhtBox = styled.div`
  background: #f1f2f7;
  margin-bottom: 6px;

`

const Rht = styled.div`
  width: 300px;
  color: #000000;
  padding:20px;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  display: flex; 
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
`

const SignBox = styled.div`
  border-radius: 4px;
  height: 54px;
  width: 100%;
  border: 1px solid #3198f9;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: linear-gradient(120deg,#3198f910 , #00c1ff30);
  margin-bottom: 40px;
  img{
    width: 16px;
    margin-right: 10px;
  }
`

const UlBox = styled.ul`
  li{
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    border: 1px dashed #3198f9;
    padding: 20px;
    cursor: pointer;
    //background: linear-gradient(120deg,#3198f910 , #00c1ff30) ;
    background:#3198f910 url(${PenImg}) no-repeat 90% center;
    background-size: 60px;
    margin-bottom: 20px;
  }
  .tit{
    font-size: 18px;
    font-family: "bold";
  }
  .addr{
    font-size: 14px;
  }
  .time{
    opacity: 0.5;
    padding-top: 10px;
    font-size: 12px;
  }
`

const After = styled.ul`

  li{
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    border: 1px dashed #ccc;
    padding: 20px;
    cursor: pointer;
    background: #eee url(${FinishedImg}) no-repeat 90% center;
    background-size: 50px;
    margin-bottom: 20px;
  }
  .tit{
    font-size: 18px;
    font-family: "bold";
  }
  .addr{
    font-size: 14px;
  }
  .time{
    opacity: 0.5;
    padding-top: 10px;
    font-size: 12px;
  }
`

const SubmitBox = styled.div`
  border-radius: 4px;
  height: 54px;
  width: 100%;
  border: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  //background: linear-gradient(0deg,#3198f9 , #00c1ff);
  background: #3198f9;
  margin-bottom: 40px;
  color: #fff;
`



interface pdfProps {
  fileUrl:string
  agreeList?:any
  showBtn?:boolean
  showNext?:boolean
  id?:string
  contract?:any
  handleNext?:Function
}
interface signObj{
  creator?:string
  saveAt?:number
  base64:string
  left:number
  page:number
  top:number
}
interface iframeObj{
  base64:string
  creator?:string
  saveAt?:number
  left:number
  page:number
  top:number
}

export default function ViewPdf(props:pdfProps){
  const {dispatch} = useSubstrate();
  // const navigate = useNavigate();
  const { fileUrl,agreeList,showBtn,id,contract,showNext,handleNext } = props;
  const [sList,setSlist] = useState<signObj[]>([]);
  const [sListIframe,setSListIframe] = useState<iframeObj[]>([]);
  const [show, setShow] = useState(false);
  const { account } = useAccount();


  const handleSign = () =>{
    (document.querySelector('#iframe') as any).contentWindow.displaySignature()
  }

  useEffect(() => {
    const getResourcesInfo =  () => {
      (document.querySelector('#iframe') as any).contentWindow.haveSignedList = agreeList
    }
    getResourcesInfo()
  }, [agreeList])


  useEffect(() => {
    (window as any).getSignatureList = function (e:iframeObj[]) {
      let arr =[...e]
      setSListIframe(arr)
    };

  }, []);

  useEffect(() => {
    const newList = sListIframe.map(item => {
      return {
        ...item,
        creator: account?.decodedAddress,
        saveAt: new Date().getTime()
      }
    });
    dispatch({ type: ActionType.SET_IFRAME, payload: [...newList]});
    setSlist([...newList]);
  }, [sListIframe.length]);

  const AddresstoShow = (address:string|undefined) => {
    if (!address) return "...";
    let frontStr = address.substring(0,4);
    let afterStr = address.substring(address.length - 4, address.length);
    return `${frontStr}...${afterStr}`
  }

  const FormatDate = (dateTime:number|undefined) =>{
    if (!dateTime) return "...";
    const t = new Date(dateTime);
    const year = t.getFullYear();
    const month = t.getMonth() + 1;
    const day = t.getDate();
    return `${month}/${day}/${year}`
  }

  const handleTo = (num:number) =>{
    (document.querySelector('#iframe') as any).contentWindow.gotoPageFrom(num)
  }

  const {metadata} = ADDRESS;
  const programId = process.env.REACT_APP_PROGRAM_ID as Hex;
  const sendMessage = useSendMessage(programId, metadata);

  let sig = JSON.stringify(sList[sList.length-1]);


  const payload = {
        "agreeOnContract": {
          "id": id,
          "resource": {
            "digest": {
              "SHA256": contract?.file?.digest.SHA256
            },
            "url": contract?.file?.url,
            "memo":sig
          }
        }
      }
  ;
  const reset = () =>{
    setShow(false);
    window.location.reload();
  }

  const handleSubmit = () =>{
    setShow(true);
    return sendMessage(payload, { onSuccess: reset })
  }

  const handleShowBtn = () =>{
    let display = true;
    const inArr = agreeList?.filter((item:any) => item.creator === account?.decodedAddress);
    if(inArr?.length){
      display = false;
    }
    return display;
  }

  const toNext = () =>{
    handleNext && handleNext();
  }


  return <Box>
    {
      show && <MaskBox><ApiLoader /></MaskBox>
    }
    <IframeBox>
      <iframe id="iframe" src={`/pdfviewer/web/viewer.html?file=${fileUrl}`} />
    </IframeBox>
    <RhtBox>


    <Rht>
      <div>
        {
          handleShowBtn() &&  <SignBox onClick={() => {handleSign()}}>
            <img src={AddImg} alt=""/>
            <span>Add My Signatures</span>
          </SignBox>
        }

        <After>
          {
            agreeList?.map((item:iframeObj,index:number)=>(  <li key={index} onClick={()=>handleTo(item.page)}>
              <div className="tit"><span>Page</span> {item.page}</div>
              <div className="addr">{AddresstoShow(item?.creator)}</div>
              <div className="time">{FormatDate(item.saveAt)}</div>
              <div className="time">{item.base64}</div>
            </li>))
          }
        </After>
        <UlBox>
          {
            sList?.map((item,index)=>(  <li key={index} onClick={()=>handleTo(item.page)}>
              <div className="tit"><span>Page</span> {item.page}</div>
              <div className="addr">{AddresstoShow(item?.creator)}</div>
              <div className="time">{FormatDate(item.saveAt)}</div>
              <div className="time">{item.base64}</div>
            </li>))
          }
        </UlBox>
      </div>

      <div>
        {
          !!sList?.length && showBtn &&<SubmitBox onClick={()=>handleSubmit()}>Submit</SubmitBox>
        }
        {
          !!sList?.length && showNext &&<SubmitBox onClick={()=>toNext()}>Next</SubmitBox>
        }
      </div>
    </Rht>
    </RhtBox>
  </Box>
}