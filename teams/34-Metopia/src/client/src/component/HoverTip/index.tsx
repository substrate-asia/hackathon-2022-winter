import React, { CSSProperties, useState } from 'react'
import './index.scss'

const HoverTip = (props: { tip: string, style?: CSSProperties }) => {
    const { tip, style } = props
    const [hover, setHover] = useState(false)
    return <div className='r-user-tip' style={style}>
        <img src="https://oss.metopia.xyz/imgs/exclamation-w.svg" className='toggle' onMouseEnter={e => {
            setHover(true)
        }} onMouseLeave={e => {
            setHover(false)
        }} />
        <div className='tip-container' style={hover ? null : { display: 'none' }}>
            <div className='text'>{tip}</div></div>
    </div>

}
export default HoverTip