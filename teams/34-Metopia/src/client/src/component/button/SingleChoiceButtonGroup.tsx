import React, { useState } from 'react'
import './SingleChoiceButtonGroup.scss'

export const SingleChoiceButton = (props) => {
    const { selected, onClick, title, activeContent, content } = props
    return <div className={'single-choice-button' + (selected ? ' selected' : '')}
        onClick={onClick} title={title}>
        {activeContent && selected ? activeContent : content}
    </div>
}

export const SingleChoiceButtonGroup = (props: { items: { content, title?, activeContent?}[], onChange, style?}) => {
    const { items, onChange, style } = props
    const [selectedIndex, setSelectedIndex] = useState(-1)

    if (!props.items?.length)
        return null

    return <div className='single-choice-button-group' style={style}>
        {items.map((i, j) => {
            return <SingleChoiceButton key={'single-choice-button-' + j} title={i.title} selected={j === selectedIndex}
                content={i.content} activeContent={i.activeContent} onClick={() => {
                    if (selectedIndex === j) {
                        setSelectedIndex(-1)
                        onChange(-1)
                    } else {
                        setSelectedIndex(j)
                        onChange(j)
                    }
                }
                } />
        })}
    </div>
}
