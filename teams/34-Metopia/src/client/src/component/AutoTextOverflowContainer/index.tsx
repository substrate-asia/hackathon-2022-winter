import React, { CSSProperties, useState } from 'react'
import './index.scss'

const AutoTextOverflowContainer = (props: { children, height: number, contentId: string, style?: CSSProperties }) => {
    const { children, height, contentId, style } = props
    const [expand, setExpand] = useState(false)
    let contentEle = window.document.getElementById(contentId)
    let overflow = contentEle?.scrollHeight > height

    return <div className={'auto-text-overflow-container'} style={Object.assign({ height: expand ? contentEle.scrollHeight + 'px' : height + 'px', paddingRight: overflow ? '50px' : 0 }, style)} >
        <div className='content' id={contentId}>
            {children}
        </div>
        {
            overflow ?
                <div className='expand-button' onClick={() => setExpand(!expand)}
                    style={{ transform: 'translateY(' + (height / 2 - 10) + 'px)' }}>All <img src="https://oss.metopia.xyz/imgs/chevron.svg" style={{
                        transform: expand ?
                            'rotate(180deg) translateY(-2px)' :
                            'translateY(2px)'
                            
                    }} /></div> : null
        }
    </div>
}

export default AutoTextOverflowContainer