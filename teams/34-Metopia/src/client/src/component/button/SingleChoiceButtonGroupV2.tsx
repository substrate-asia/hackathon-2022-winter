import React, { CSSProperties, useState } from 'react'
import './SingleChoiceButtonGroupV2.scss'

export const SingleChoiceButton = (props) => {
    const { selected, onClick, title, activeContent, content } = props
    return <div className={'single-choice-button' + (selected ? ' selected' : '')}
        onClick={onClick} title={title}>
        {activeContent && selected ? activeContent : content}
    </div>
}

export const SingleChoiceButtonGroupV2 = (props: {
    items: { content, title?, activeContent?}[],
    onChange: (index: number) => any, defaultOption?: number, style?: CSSProperties
}) => {
    const { items, onChange, style } = props
    const [selectedIndex, setSelectedIndex] = useState(props.defaultOption != null ? props.defaultOption : -1)

    if (!props.items?.length)
        return null

    return <div className='single-choice-button-group-v2' style={style}>
        {items.map((i, j) => {
            return <SingleChoiceButton key={'single-choice-button-' + j} title={i.title} selected={j === selectedIndex}
                content={i.content} activeContent={i.activeContent} onClick={() => {
                    setSelectedIndex(j)
                    onChange(j)
                }} />
        })}
    </div>
}
