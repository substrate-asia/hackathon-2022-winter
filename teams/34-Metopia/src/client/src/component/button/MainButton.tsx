import React, { useState } from 'react'
import './MainButton.scss'
import ReactLoading from 'react-loading';

const MainButton = (props) => {
    const [loading, setLoading] = useState(false)
    return <div className={"main-button" + (props.solid ? ' solid' : '') + (props.disabled ? ' disabled' : '') + (props.loading || loading ? " loading" : '')
        + (props.className ? ' ' + props.className : '')} style={props.style}
        onClick={async (e) => {
            if (!props.disabled && !(props.loading || loading)) {
                setLoading(true)
                try {
                    await props.onClick(e)
                } finally {
                    setLoading(false)
                }
            }
        }} >
        <div className={'container'}>
            <div className="content">{props.children}</div>
            {props.loading || loading ? <ReactLoading height={'20px'} width={'20px'} className="loadingicon" color='#dddddd' /> : ""}
        </div>
    </div>
}


export default MainButton 