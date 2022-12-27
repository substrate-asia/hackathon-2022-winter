import { useNavigate } from "react-router-dom";
import Layout from "./components/layout/layout";
import styled from "styled-components";
import ViewImg from "./assets/images/icon_eye.svg";
import DownImg from "./assets/images/icon_download.svg";
import History from "./assets/images/icon_history.svg";
import Finished from "./assets/images/icon_check_handwritten.svg";
import {useEffect, useState} from "react";
import ReactPaginate from 'react-paginate';
import {ADDRESS} from "./consts";
import {Hex} from "@gear-js/api";
import {useAccount, useReadState} from "@gear-js/react-hooks";
import {ApiLoader} from "./components";
import publicJs from "./utils/publicJs";
import ContractImg from "./assets/images/icon_contract.svg";

const MaskBox = styled.div`
    width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #000;
  z-index: 19;
`

const Box = styled.div`
    padding:20px 40px 40px;
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
    align-items: stretch;
    justify-content: space-between;
    background: #040404;
    border-radius: 4px;
    background: linear-gradient(180deg,#468a4d,#263d7f);
    padding: 1px 1px 1px 5px;
  }
  .bg{
    background: #040404;
    border-radius: 4px;
    width: 100%;
    height: 100%;
    display: flex;
    padding: 20px;
    align-items: flex-start;
    flex-direction: column;
    .inner{
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
      border-bottom: 1px dashed rgba(255,255,255,0.2);
      padding-bottom: 10px;
    }
  }
  .name{
    font-family: "bold";
    font-size: 20px;
    padding-bottom: 5px;
  }
  .time{
    font-family: "Lato-Light";
    opacity: 0.5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .timeBtm{
    padding-top: 10px;
    opacity: 0.5;
    span{
      font-family: "Lato-Light";
      padding-left: 15px;
    }
  }
`

const LineBox = styled.div`
  .addrBox{
    width: 100%;
    display: flex;
    align-items: flex-start;
    margin-top: 10px;
    .finishedImg img{
      width: 20px;
      margin-left: 10px;
      margin-top: -6px;
    }
  }
  .tit{
    margin-right: 20px;
  }
  .rhtD{
    display: flex;
    align-items: center;

  }
`
const Operation = styled.ul`
    display: flex;
  justify-content: flex-end;
  align-items: center;
  .li{
    display: flex;
    align-items: center;
  }
    img{
      width: 20px;
      margin-right: 10px;
      cursor: pointer;
    }
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
const NoEmpty = styled.div`
    width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default function Mine(){
    const navigate = useNavigate();
    const { account } = useAccount();

    const [list,setList] = useState([]);
    const [pageCount, setPageCount] = useState(1);
    const pageSize = 10;
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(1);
    const [show, setShow] = useState(false);

    const {metadata} = ADDRESS;
    const programId = process.env.REACT_APP_PROGRAM_ID as Hex;


    const payload ={
        "QueryContractByCreator": [
            {
                "pageNum": current,
                "pageSize":pageSize
            },
            account?.decodedAddress
        ]
    }

    const stateAll = useReadState(programId, metadata, payload);
    useEffect(()=>{
        setShow(true);
        if(!(stateAll as any).state || !(stateAll as any).state!.Contracts)  return;
        const {total,pages,pageNum,pageSize,data} = (stateAll as any).state.Contracts;
        if(pageNum == current){
            setShow(false);
        }else{
            setShow(true);
        }
        setPageCount(pages);
        setTotal(total)
        setList(data)
    },[(stateAll as any).state,current]);


    const handleView = (num:number) =>{
        navigate(`/detail/${num}`)
    }

    const handlePageClick = (event:{ selected: number }) => {
        setCurrent((event as any).selected + 1);
    }

    const formatTime = (time:string) =>{
        let str = time.replace(/,/g, "");
        let res =  publicJs.dateFormat(Number(str))
        return res
    }

    return <div>
        {
            show && <MaskBox><ApiLoader /></MaskBox>
        }
         <Layout>
                <Box>
                    <TabBox>
                        <li className="active">My Contracts</li>
                    </TabBox>
                    <UlBox>
                        {
                            !list.length && <NoEmpty><img src={ContractImg} alt=""/></NoEmpty>
                        }
                        {
                            !!list.length && list.map((item:any,index)=>(<li key={index}>
                                <div className="bg">
                                    <div className="inner">
                                        <div className="fir">
                                            <div className="name">{item.name}</div>
                                            <div className="time">Created: {formatTime(item.createAt)}</div>

                                        </div>
                                        <div className="status">{item.status}</div>
                                        <Operation>
                                            <div className="li">
                                                <img src={ViewImg} alt="View"  onClick={()=>handleView(item.id)} />
                                            </div>
                                            {/*<div className="li">*/}
                                            {/*    <img src={DownImg} alt="Download"/>*/}
                                            {/*</div>*/}
                                            {/*<div className="li">*/}
                                            {/*    <img src={History} alt="History"/>*/}
                                            {/*</div>*/}

                                        </Operation>
                                    </div>
                                    <LineBox>

                                        <div className="addrBox">
                                            <div className="tit">Creator</div>
                                            <div className="addr">{publicJs.AddresstoShow(item.creator)}</div>
                                            <div className="finishedImg"><img src={Finished} alt=""/></div>
                                        </div>
                                        <div className="addrBox">
                                            <div className="tit">Signers</div>
                                            <div >
                                                {
                                                    item.signers.map((Th:string,index:number)=><div className="rhtD" key={`signers_${index}`}>
                                                        {
                                                            Th !== item.creator &&
                                                            <div className="addr">{publicJs.AddresstoShow(Th)}</div>
                                                        }
                                                        {
                                                            !!item.agreeOn[Th] && Th !== item.creator && <div className="finishedImg">
                                                                <img src={Finished} alt=""/>
                                                            </div>
                                                        }

                                                    </div> )
                                                }
                                            </div>

                                        </div>
                                        <div className="timeBtm">Expired <span>{formatTime(item.expire)}</span></div>
                                    </LineBox>
                                </div>
                            </li>))
                        }

                    </UlBox>
                    {
                        !!list.length &&<PageLine>
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
                                onPageChange={(e)=>handlePageClick(e)}
                                containerClassName="pagination"
                                activeClassName="active"
                            />
                        </PageLine>
                    }


                </Box>
            </Layout>

    </div>
}