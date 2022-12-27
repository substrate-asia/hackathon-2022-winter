import React from 'react'
import './index.scss'

const Reference = (props: { sources: { imgUrl: string, link: string }[] }) => {
    const { sources } = props
    return <div className="profile-reference">
        <div className="title">Data source:</div>
        {
            sources.map(source => {
                return <a className="source-wrapper" href={source.link} key={'source-wrapper-' + source.imgUrl}>
                    <img src={source.imgUrl} alt="rss3" />
                </a>
            })
        }
    </div>
}


export default Reference
