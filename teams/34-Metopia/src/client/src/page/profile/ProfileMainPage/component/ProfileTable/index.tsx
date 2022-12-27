import React from 'react'
import './index.scss'
const ProfileTable = (props) => {
    const { heads, data, onSelect } = props
    return <table className={"profile-table"} >
        <thead>
            <tr>
                {
                    heads.map((h, i) => {
                        return <th key={"head-" + i}>{h}</th>
                    })
                }
            </tr>
        </thead>
        <tbody>
            {
                data.map((d, i) => {
                    return <tr key={"row-" + i} onClick={() => { onSelect && onSelect(i) }} className={onSelect ? ' selectable' : ''}>
                        {d.map((d1, j) => {
                            return <td key={"cell-" + i + "-" + j} style={heads[j]?.toLowerCase() === 'date' ? { whiteSpace: 'nowrap' } : null}>{d1}</td>
                        })}
                    </tr>
                })
            }
        </tbody>
    </table>
}
export default ProfileTable