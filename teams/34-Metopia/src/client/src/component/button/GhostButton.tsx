import React, { useState } from 'react'
import './GhostButton.scss'

const GhostButton = (props) => {
    const [hover, setHover] = useState(false)
    return <div className={'ghost-button' + (hover || props.active ? ' active' : '') + (props.selected ? ' selected' : '')}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onClick={props.onClick} title={props.title}>
        <div className='wrapper'>
            {props.activeContent && hover ? props.activeContent : props.content}
        </div>
    </div>
}

const GhostButtonGroup = (props: { items, style?}) => {
    if (!props.items?.length)
        return null

    return <div className='ghost-button-group' style={props.style}>
        {props.items.map((i, j) => {
            return <GhostButton key={'GhostButton-' + j} title={i.title} active={i.active} selected={i.selected}
                content={i.content} activeContent={i.activeContent} onClick={() => {
                    if (i.link) window.location.href = i.link
                    if (i.onClick) i.onClick()
                }
                } />
        })}
    </div>
}
export default GhostButton
export { GhostButtonGroup }
