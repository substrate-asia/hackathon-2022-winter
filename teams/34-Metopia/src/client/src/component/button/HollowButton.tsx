import React from 'react'
import './HollowButton.scss'
 const HollowButton = (props) => {
    return <div className={"hollow-button " +(props.className||'')} onClick={props.onClick} style={props.style}><div className='container'>{props.children}</div></div>
}

export default HollowButton