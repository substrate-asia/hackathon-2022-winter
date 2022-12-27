import React, { CSSProperties, useState } from 'react'
import './index.scss'

const ExpandableChoice = (props: {
    items: { title, text }[],
    onChange: (index: number) => any, defaultOption?: number
}) => {
    const { items, onChange } = props
    const [selectedIndex, setSelectedIndex] = useState(props.defaultOption != null ? props.defaultOption : -1)

    return <div className='expandable-choice-group'>
        {
            items.map((item, i) => {
                return <div key={`expandable-choice-${i}`} className={"expandable-choice" + (selectedIndex === i ? ' selected' : '')} onClick={e => {
                    setSelectedIndex(i)
                    onChange(i)
                }}>
                    <div className='container'>
                        <div className='title'>{item.title}</div>
                        <div className='text'>{item.text}</div>
                    </div>
                </div>
            })
        }
    </div>
}

export default ExpandableChoice