import styled from "styled-components";
import {useEffect, useState} from "react";

const Box = styled.div`
  background: #1c1d22;
  box-shadow: 2px 0 5px rgb(0 0 0 / 20%);
  padding:0 20px;
  border-radius: 4px;
  li{
    cursor: pointer;
  }
  .step-wizard-list{
    color: #fff;
    list-style-type: none;
    border-radius: 10px;
    display: flex;
    padding: 20px 10px;
    position: relative;
    z-index: 10;
  }

  .step-wizard-item{
    padding: 0 20px;
    flex-basis: 0;
    -webkit-box-flex: 1;
    -ms-flex-positive:1;
    flex-grow: 1;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    min-width: 170px;
    position: relative;
  }
  .step-wizard-item + .step-wizard-item:after{
    content: "";
    position: absolute;
    left: 0;
    top: 19px;
    background: #fcca00;
    width: 100%;
    height: 2px;
    transform: translateX(-50%);
    z-index: -10;
  }
  .progress-count{
    height: 40px;
    width:40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 600;
    margin: 0 auto;
    position: relative;
    z-index:10;
    color: transparent;
  }
  .progress-count:after{
    content: "";
    height: 40px;
    width: 40px;
    background: #fcca00;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    z-index: -10;
  }
  .progress-count:before{
    content: "";
    height: 10px;
    width: 20px;
    border-left: 3px solid #000;
    border-bottom: 3px solid #000;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -60%) rotate(-45deg);
    transform-origin: center center;
  }
  .progress-label{
    font-size: 14px;
    font-weight: 600;
    margin-top: 10px;
  }
  .current-item .progress-count:before,
  .current-item ~ .step-wizard-item .progress-count:before{
    display: none;
  }
  .current-item ~ .step-wizard-item .progress-count:after{
    height:10px;
    width:10px;
  }
  .current-item ~ .step-wizard-item .progress-label{
    opacity: 0.5;
  }
  .current-item .progress-count:after{
    background: #000;
    border: 2px solid #fcca00;
  }
  .current-item .progress-count{
    color: #fcca00;
  }
`
interface Iprops{
    checkStep:Function
    currentStep:number
}

export default function StepNav(props:Iprops){
    const {checkStep,currentStep} = props;

    const [current,setCurrent] = useState(1);
    const [list] = useState(["Upload Document", "Manage Recipients","Prepare Documents","Review and Send"]);

    useEffect(()=>{
        setCurrent(currentStep);
    },[currentStep])

    const handleCurrent = (num:number) =>{
        checkStep(num+1)
    }

    return <Box>
            <ul className="step-wizard-list">
                {
                    list.map((item,index)=>( <li key={index} onClick={()=>handleCurrent(index)} className={current === index+1?'step-wizard-item current-item':'step-wizard-item'}>
                        <span className="progress-count">{index+1}</span>
                        <span className="progress-label">{item}</span>
                    </li>))
                }
            </ul>
    </Box>
}