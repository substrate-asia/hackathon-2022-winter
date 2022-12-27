import React from "react";
import './index.css';
const UniswapDataTable = (props: { data, style?}) => {
    const { data } = props
    return <table className="UniswapDataTable" style={props.style}>
        <thead>
            <tr>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Volume</th>
            </tr>
        </thead>
        <tbody>
            {data.map((d, i) => {
                return <tr key={'uniswapV3Data' + i}>
                    <td>{new Date(d.timestamp * 1000).toLocaleString("en-US")}</td>
                    <td>{d.from}</td>
                    <td>{d.to}</td>
                    <td>{d.volume.toFixed(2)} USD</td>
                </tr >
            })}
        </tbody>
    </table>

}
export default UniswapDataTable