import React from 'react'
import { Select } from '..'
import './index.scss'

const options = [
    {
        value: 1, text: <div className='chain-selector-option'>
            <img src="https://oss.metopia.xyz/imgs/ethereum-w.svg" alt="" />
            <div className="text">Ethereum</div>
        </div>
    },
    // {
    //     value: 5, text: <div className='chain-selector-option'><img src="https://oss.metopia.xyz/imgs/ethereum-w.svg" alt="" />
    //         <div className="text">Goerli</div></div>
    // },
    // {
    //     value: 11155111, text: <div className='chain-selector-option'><img src="https://oss.metopia.xyz/imgs/ethereum-w.svg" alt="" />
    //         <div className="text">Sepolia</div></div>
    // },
    {
        value: 0x89, text: <div className='chain-selector-option'>
            <div className='img-wrapper'>
                <img src="https://oss.metopia.xyz/imgs/polygon.svg" alt="" />
            </div>
            <div className="text">Polygon</div></div>
    },
     {
        value: 56, text: <div className='chain-selector-option'>
            <img src="https://oss.metopia.xyz/imgs/bsc.svg" alt="" />
            <div className="text">BNB Chain</div></div>
    },
]


const ChainSelector = (props: { value: string, onChange }) => {
    const { value, onChange } = props
    return <div className='chain-selector'><Select options={options} onChange={onChange} value={value}
        invalidOption={<div className='chain-selector-option'><div className="text" >Invalid network</div></div>} /></div>
}

export default ChainSelector