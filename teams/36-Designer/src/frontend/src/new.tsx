import Layout from "./components/layout/layout";
import styled from "styled-components";
import StepNav from "./components/new/stepNav";
import Step1 from "./components/new/step1";
import Step2 from "./components/new/step2";
import Step3 from "./components/new/step3";
import Step4 from "./components/new/step4";
import {useState} from "react";

const Box = styled.div`
    padding:20px 40px 40px;
`

interface obj{
    name:string
    address:string
    decodedAddress:string
}


export default function New(){

    const [currentStep, setCurrentStep] = useState(1);
    const [fileUrl, setFileUrl] = useState('');
    const [fileObj, setFileObj] = useState();
    const [list, setList] = useState<obj[]>([]);

    const checkStep = (num:number)=>{
        setCurrentStep(num)
    }
    const handleUrl = (url:string,fileObj:any) =>{
        setFileUrl(url)
        setFileObj(fileObj)
    }

    const handleList = (arr:obj[]) =>{
        setList(arr)
    }

    return <div>
        <Layout>
            <Box>
                <StepNav checkStep={checkStep} currentStep={currentStep}/>
                {
                    currentStep === 1 &&<Step1 checkStep={checkStep} handleUrl={handleUrl} />
                }
                {
                    currentStep === 2 &&<Step2 checkStep={checkStep} handleList={handleList}/>
                }
                {
                    currentStep === 3 &&<Step3 checkStep={checkStep} fileUrl={fileUrl}/>
                }
                {
                    currentStep === 4 &&<Step4 list={list} fileUrl={fileUrl} fileObj={fileObj}/>
                }

            </Box>
        </Layout>
    </div>
}