import React, { CSSProperties } from 'react'
import './index.scss'

type Step = {
    text: string,
    state: number
}

const StepLinearIndicator = (props: { steps: Step[], style?: CSSProperties }) => {
    return <div className='step-linear-indicator' style={props.style}>
        {
            props.steps.map(step => {
                return <div className={"step-icon " + (step.state > 0 && 'active')} key={`step${step.text}`}>
                    {
                        step.state > 1 ?
                            <img src="https://oss.metopia.xyz/imgs/colored-step-tick.svg" alt="" className='icon' /> :
                            <img src="https://oss.metopia.xyz/imgs/colored-step.svg" alt="" className='icon' />
                    }
                    <div className='text'>{step.text}</div>
                    <div className="step-linker"></div>
                </div>
            })
        }
    </div>
}

export default StepLinearIndicator