import React from "react"
import { useScrollTop } from "../../../utils/useScollTop"
import StepLinearIndicator from "../../StepLinearIndicator"
import './index.scss'

const FixedablePageHead = (props: { backLink, setPage?, page?, onBack?, title, subtitle?, steps }) => {
    // 200
    const { backLink, setPage, page, title, subtitle, steps, onBack } = props
    const [scrollTop] = useScrollTop()
    return <div className="fixedable-page-head">
        <div className="head" style={{ opacity: scrollTop > 89 ? Math.max(289 - scrollTop, 0) * 0.005 : 1 }}>
            <a className='back-button' onClick={() => {
                if (onBack) { onBack() }
                else {
                    if (page === 1 || !setPage) {
                        window.location.href = backLink
                    }
                    else {
                        // document.getElementById("RuleSettingsBodyContainer").style.transition = '300ms'
                        setPage(page - 1)
                    }
                }
            }}><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></a>
            <div className='title'>{title}</div>
            {
                subtitle ? <div className='subtitle'>{subtitle}</div> : null
            }
            <StepLinearIndicator steps={steps} style={{ marginTop: '65px' }} />
        </div>
        <div className={'head-fixed' + (scrollTop < 189 ? " invisible" : '')} style={{
            opacity: 1 - (scrollTop > 189 ? Math.max(389 - scrollTop, 0) * 0.005 : 1),
            zIndex: '8888',
            position: scrollTop > 189 ? 'fixed' : 'unset'
            // transform: scrollTop > 250 ? 'translate(' + (Math.max(300 - scrollTop, 0) * 2) + "vw)" : 'translateX(100vw)'
        }}>
            <div className='container'>
                <a className='back-button' onClick={() => {
                    if (scrollTop < 189)
                        return
                    if (onBack) { onBack() }
                    else {
                        if (page === 1 || !setPage) {
                            window.location.href = backLink
                        }
                        else {
                            // document.getElementById("RuleSettingsBodyContainer").style.transition = '300ms'
                            setPage(page - 1)
                        }
                    }
                }}><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></a>
                <div className='title'>{title}</div>
                <StepLinearIndicator steps={steps} style={{ marginTop: '65px' }} />
            </div>
        </div>
    </div>
}

export default FixedablePageHead