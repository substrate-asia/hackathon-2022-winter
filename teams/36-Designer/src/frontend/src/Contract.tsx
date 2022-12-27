import {useEffect, useState} from "react";
import styled from "styled-components";
import Layout from "./components/layout/layout";
import { useNavigate } from "react-router-dom";
import DownImg from "./assets/images/icon_down_arrow_outline.svg";
import CheckImg from "./assets/images/icon_check.svg";
import Wait from "./components/wait";
import {ADDRESS} from "./consts";
import {Hex} from "@gear-js/api";
import {useAccount, useReadState} from "@gear-js/react-hooks";
import ReactPaginate from 'react-paginate';
import publicJs from "./utils/publicJs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import CopyImg from "./assets/images/icon-copyWhite.svg";
import {ApiLoader} from "./components";
import Finished from "./assets/images/icon_check_handwritten.svg";
import ContractImg from "./assets/images/icon_contract.svg";

const Box = styled.div`
    padding:20px 40px 40px;
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

const TabBox = styled.ul`
    display: flex;
    justify-content: flex-start;
  border-bottom: 2px solid rgba(255,255,255,0.3);
  li{
    font-family: "bold";
    font-size: 22px;
    padding: 10px 20px;
    color: rgba(255,255,255,0.5);
    margin-bottom: -2px;
    cursor: pointer;
    &.active{
      border-bottom: 2px solid #fcca00;
      color: #ffffff;
    }
  }
`

const UlBox = styled.ul`
  width: 100%;
  li{
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    background: #1c1d22;
    border-radius: 4px;
  }
  .line{
    background: linear-gradient(90deg,#468a4d,#263d7f);
    height: 7px;
    width: 100%;
    border-radius: 4px 4px 0 0;
  }
   dl {
     cursor: pointer;
    }
  dt{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    &>div{
      width: 33.33333%;
    }
    .name{
      text-align: left;
    }
    .time{
      text-align: center;
    }
    .status{
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .rht img{
        width: 20px;
        margin:6px 0 0 10px;
      }
    }
  }
  dd{
    border-top: 1px dashed rgba(255,255,255,0.2);
    padding: 20px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    &.show{
      display: flex;
    }
    &.none{
      display: none;
    }
  }
`

const TimeLine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 40px;

  .liBox{
    padding-left: 40px;
    width: 100%;
  }
  .tit{
    display: flex;
    align-items: flex-start;
    margin-left: -60px;
    span{
      margin-left: 20px;
      padding:10px 30px;
      background: #000;
      border-radius: 4px;
      position: relative;
      &:before {
        position: absolute;
        top: 13px;
        left: 0;
        content: "";
        margin-left: -7px;
        border-top: 7px solid transparent;
        border-bottom: 7px solid transparent;
        border-right: 7px solid #000;
      }
    }
  }
  .icon{
    margin-right:10px;
    background: linear-gradient(120deg,#3198f9, #00c1ff);
    width: 40px;
    height: 40px;
    border-radius: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    img{
      width:30px;
    }
  }
`
const LftBox = styled.div`
    display: flex;
  flex-direction:column;
  .brdr{
    border-left: 1px dashed #3198f9;
    &:last-child{
      border-left: 0;
    }
  }
`

const ContentBox = styled.div`
    padding: 10px 0 30px;
  width: 100%;
  .addr{
    padding:10px 20px;
    opacity: 0.5;
    width: 100%;
  }
`

const RhtBox = styled.div`
    padding: 40px;
  width: 40%;
  border-left: 1px dashed rgba(255,255,255,0.1);
  .hashLine{
    margin-bottom: 30px;
  }
  .top{
    opacity: 0.5;
    padding-bottom: 10px;
  }
`
const LastLine = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fcca00;
  color: #000000;
  padding: 0 20px;
  border-radius: 4px;
  font-family: "Lato-Light";
  height: 40px;
  cursor: pointer;
  width: 100px;
  white-space: nowrap;
`
const PageLine = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 30px;
  a{
    text-decoration: none;
    color: #ffffff;
  }
  .page-break{
    width: 32px;
    height: 32px;
    text-align: center;
    line-height: 32px;
  }
  .page-link,.page-left,.page-right{
    width: 32px;
    height: 32px;
    border: 0;
    text-align: center;
    line-height: 32px;
    padding: 0;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    color: #fff;
    background: transparent;
  }
  .page-link{
    &:hover{
      color: #fcca00;
    }
    &:focus{
      box-shadow: none;
    }
  }


  .disabled {
    .pageL {
      color: #f2f2f2 !important;
    }
    &:hover{
        border: none;
    }
  }
  .active{
    .page-link{
      color: #fcca00;
    }
  }
`

const CopiedBtn = styled.div`
  position: relative;
  img{
    width: 24px;
  }
  span{
    position: absolute;
    top: 25px;
    left: 0;
  }
`
const FL =styled.div`
  display: flex;
  align-items: center;
  a{
    color: #ffffff;
  }
`

const NoEmpty = styled.div`
    width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`


export default function Contract(){
    const navigate = useNavigate();
    const { account } = useAccount();
    const [currentNav, setCurrrentNav] = useState<number>(0);
    const [ Nav ] = useState(['Queue','History']);
    const [ showArr,setShowArr ] = useState(new Array(6).fill(false));

    const [list,setList] = useState([]);
    const [pageCount, setPageCount] = useState(1);
    const pageSize = 10;
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(1);
    const [show, setShow] = useState(false);

    const [ showTips,setShowTips] = useState(false);
    const [ showTips2,setShowTips2] = useState(false);

    const handleClick = (i:number) => {
        setCurrrentNav(i);
        setCurrent(1)
    };

    const handleShow = (num:number) =>{
        let arr:boolean[] =new Array(6).fill(false);
        arr[num] = true;
        setShowArr(arr);
    }

    const handleView = (num:number) =>{
        navigate(`/detail/${num}`)
    }

    const {metadata,NODE} = ADDRESS;
    const programId = process.env.REACT_APP_PROGRAM_ID as Hex;

    let arr = currentNav === 0 ? [
        {
            "Created": null
        },
        {
            "Signing": null
        }
    ]:  [
        {
            "Sealed": null
        }
    ]

    // const payload ={
    //     "QueryContractBySignerAndStatus": [
    //         {
    //             "pageNum": current,
    //             "pageSize":pageSize
    //         },
    //         account?.decodedAddress,
    //         arr
    //     ]
    // }
    const payload ={
        "QueryContractBySigner": [
            {
                "pageNum": current,
                "pageSize":pageSize
            },
            account?.decodedAddress
        ]
    }


    // console.error(payload)

    const stateAll = useReadState(programId, metadata, payload);
    useEffect(()=>{
        setShow(true);
        if(!(stateAll as any).state || !(stateAll as any).state!.Contracts)  return;
        const {total,pages,pageNum,data} = (stateAll as any).state.Contracts;
        console.error(data)
        if(pageNum == current){
            setShow(false);
        }else{
            setShow(true);
        }
        setPageCount(pages);
        setTotal(total)
        setList(data)
    },[(stateAll as any).state,current]);

    const handlePageClick = (event:{ selected: number }) => {
        setCurrent((event as any).selected + 1);
    }

    const formatTime = (time:string) =>{
        let str = time.replace(/,/g, "");
        let res =  publicJs.dateFormat(Number(str))
        return res
    }

    const handleCopy = () =>{
        setShowTips(true)
        setTimeout(()=>{
            setShowTips(false)
        },1000)
    }
    const handleCopy2 = () =>{
        setShowTips2(true)
        setTimeout(()=>{
            setShowTips2(false)
        },1000)
    }
    const handleWait = (obj:any) =>{

        let res = false;
        obj.signers.map((item:string)=>{
            res = !!obj.agreeOn[item]
        })

        return res
    }
    const showTit = (item:any) =>{
        if(currentNav){
            return'View'
        } else{
            let res =false;
            for(let key in item.agreeOn){
               if(key == account?.decodedAddress){
                   res = true;
                   break;
               }
            }
            return !res?'Sign Now':'View'
        }
    }

    return  <div>
        {
            show && <MaskBox><ApiLoader /></MaskBox>
        }
        <Layout>
            <Box>
                <TabBox>
                    {
                        Nav.map((item,index)=><li key={`nav_${index}`} className={currentNav === index ? "active" : ""} onClick={()=>handleClick(index)}>{item}</li>)
                    }
                </TabBox>
                <UlBox>
                    {
                        !list.length && <NoEmpty><img src={ContractImg} alt=""/></NoEmpty>
                    }
                    {
                        !!list.length && list.map((item:any,index:number)=>(<li key={index}>
                            <div className="line" />
                            <dl onClick={()=>handleShow(index)}>
                                <dt>
                                    <div className="name">{item.name}</div>
                                    <div className="time">{formatTime(item.expire)}</div>
                                    <div className="status">
                                        <div>{item.status}</div>
                                        <div className="rht">
                                            <img src={DownImg} alt=""/>
                                        </div>
                                    </div>
                                </dt>
                                <dd className={showArr[index]?'show':'none'}>
                                    <LftBox>
                                        <TimeLine className="brdr">
                                            <div className="liBox">
                                                <div className="tit">
                                                    <div className="icon">
                                                        <img src={CheckImg} alt=""/>

                                                    </div>
                                                    <span>Creator</span>
                                                </div>
                                                <ContentBox >
                                                    <div className="addr">{publicJs.AddresstoShow(item.creator)}</div>
                                                </ContentBox>
                                            </div>
                                        </TimeLine>
                                        <TimeLine className="brdr">
                                            <div className="liBox">
                                                <div className="tit">
                                                    <div className="icon">
                                                        {
                                                          !handleWait(item) &&<Wait />
                                                        }
                                                        {
                                                          handleWait(item) && <img src={CheckImg} alt=""/>
                                                        }

                                                    </div>
                                                    <span>Signers</span>
                                                </div>
                                                <ContentBox >
                                                    {
                                                        item.signers.map((Th:string,index:number)=>
                                                            <div key={`signers_${index}`}>{
                                                                Th!==item.creator && <div className="addr">{publicJs.AddresstoShow(Th)}</div>
                                                            }
                                                            </div>
                                                            )
                                                    }
                                                </ContentBox>
                                            </div>
                                        </TimeLine>
                                    </LftBox>
                                    <RhtBox>
                                        <div className="hashLine">
                                            <div className="top">TX Hash: </div>
                                            <FL>
                                                <div>
                                                    <a href={`https://idea.gear-tech.io/messages/${item.creatTx}?node=${NODE}`} target="_blank" rel="noreferrer">{publicJs.AddresstoShow(item.creatTx)}</a>
                                                </div>
                                                <CopyToClipboard text={item.creatTx} onCopy={handleCopy}>
                                                    <CopiedBtn>
                                                        <img src={CopyImg} alt=""/>
                                                        {
                                                            showTips &&<span>Copied!</span>
                                                        }

                                                    </CopiedBtn>
                                                </CopyToClipboard>
                                        </FL>
                                        </div>
                                        <div className="hashLine">
                                            <div className="top">File Hash: </div><FL><div>{publicJs.AddresstoShow(item.file.digest.SHA256)}</div><CopyToClipboard text={item.file.digest.SHA256} onCopy={handleCopy2}>
                                            <CopiedBtn>
                                                <img src={CopyImg} alt=""/>
                                                {
                                                    showTips2 &&<span>Copied!</span>
                                                }

                                            </CopiedBtn>
                                        </CopyToClipboard>
                                        </FL>
                                        </div>
                                        <div className="hashLine">
                                            <div className="top">Created: </div><div>{formatTime(item.createAt)}</div>
                                        </div>
                                        <LastLine onClick={()=>handleView(item.id)}>
                                            {showTit(item)}
                                        </LastLine>
                                    </RhtBox>
                                </dd>

                            </dl>
                        </li>))
                    }
                </UlBox>
                {
                    !!list.length &&
                    <PageLine>
                        <ReactPaginate
                            previousLabel="<"
                            nextLabel=">"
                            pageClassName="page-item"
                            pageLinkClassName="page-link"
                            previousClassName="page-left"
                            previousLinkClassName="pageL"
                            nextClassName="page-right"
                            nextLinkClassName="pageR"
                            breakLabel="..."
                            breakClassName="page-break"
                            breakLinkClassName="page-break"
                            pageCount={pageCount}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={5}
                            onPageChange={(e) => handlePageClick(e)}
                            containerClassName="pagination"
                            activeClassName="active"
                        />
                    </PageLine>
                }
            </Box>
        </Layout>
    </div>
}