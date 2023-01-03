import styled from "styled-components";
import ViewPdf from "./components/ViewPdf";
import Layout from "./components/layout/layout";
import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import {useReadState} from "@gear-js/react-hooks";
import {ADDRESS} from "./consts";
import {Hex} from "@gear-js/api";
import {ApiLoader} from "./components";


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
  height: 100vh;
  padding: 40px;
  box-sizing: border-box;
`

export default function Detail(){
    const [show, setShow] = useState(true);
    const [agreeList,setAgreeList] = useState<any[]>([]);
    const [contract,setContract] = useState<any[]>([]);
    const [url,setUrl] = useState('');

    const {id} = useParams();
    const payload ={
        "QueryContractById":id
    }
    const {metadata} = ADDRESS;
    const programId = process.env.REACT_APP_PROGRAM_ID as Hex;
    const stateAll = useReadState(programId, metadata, payload);

    useEffect(()=>{
        if(!stateAll.state)return;
        setShow(false);
        let all = (stateAll as any).state.Contract.otherRes;
        let arr=[];
        for(let key in all){
            let item = all[key][0];
            if(item.cate === "SignMetadata"){
                const{creatAt,creator} = item;
                let info = JSON.parse(item.memo);
                let str = creatAt.replace(/,/g, "");
                arr.push(
                    {
                        ...info,
                        saveAt:Number(str),
                        creator
                    }
                )
            }
        }
        setAgreeList(arr)
        setContract((stateAll as any).state!.Contract)
        const {file } = (stateAll as any).state.Contract;
        const {url} = file;
        setUrl(url);
    },[stateAll.state])

    return <div>
        {
            show && <MaskBox><ApiLoader /></MaskBox>
        }
        <Layout>
            <Box>
                <ViewPdf fileUrl={url} agreeList={agreeList} showBtn={true} id={id} contract={contract} />
            </Box>

        </Layout>
    </div>
}
