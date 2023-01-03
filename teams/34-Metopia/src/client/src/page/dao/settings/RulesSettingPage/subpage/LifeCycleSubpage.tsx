import React, { useState } from 'react'
import { FormGroup, Label, Input, DurationInput } from '../../../../../component/form'
import SettingsOption from '../../../../../component/SettingsOption'
import './LifeCycleSubpage.scss'

const LifeCycleSubpage = props => {
    const { data, setData } = props
    const [expand1, setExpand1] = useState(data.delay > 0)
    const [expand2, setExpand2] = useState(data.period > 0)
    const [expand3, setExpand3] = useState(data.quorum > 0)

    return <div className="life-cycle-subpage">
        <SettingsOption title={'Review period'}
            subtitle={'The time from the beginning of the proposal to public voting'}
            options={['Flexible rules', 'Standard rules']}
            onActive={() => {
                setData({ delay: data.delayUnit })
                setExpand1(true)
            }} onDeactive={() => {
                setData({ delay: 0 })
                setExpand1(false)
            }}
            defaultHeight={150} expand={expand1} className={'metadata-option'}>
            <FormGroup>
                <Label>Set up a uniform rules for all proposals</Label>
                <DurationInput
                    onChange={val => {
                        setData({ delay: val })
                    }}
                    defaultValue={data?.delayUnit}
                    placeholder={0}
                    value={data.delay}
                    unit={data.delayUnit || 3600 * 24}
                    onChangeUnit={val => setData({ delayUnit: val })} style={{ background: '#15182B' }} />
            </FormGroup>
        </SettingsOption>
        <SettingsOption title={'Voting period'}
            subtitle={'Duration of voting period'}
            options={['Flexible rules', 'Standard rules']}
            onActive={() => {
                setData({ period: data.periodUnit })
                setExpand2(true)
            }} onDeactive={() => {
                setData({ period: 0 })
                setExpand2(false)
            }}
            defaultHeight={150} expand={expand2}>
            <FormGroup>
                <Label>Set up a uniform rules for all proposals</Label>
                <DurationInput
                    onChange={val => {
                        setData({ period: val })
                    }}
                    defaultValue={data?.periodUnit}
                    placeholder={0}
                    value={data.period}
                    unit={data.periodUnit || 3600 * 24}
                    onChangeUnit={val => setData({ periodUnit: val })} style={{ background: '#15182B' }} />
            </FormGroup>
        </SettingsOption>

        <SettingsOption title={'Quorum'}
            subtitle={'Set the minimum amount of Voting Power to pass the proposal'}
            onActive={() => {
                setExpand3(true)
            }} onDeactive={() => {
                setData({ quorum: 0 })
                setExpand3(false)
            }}
            defaultHeight={150} expand={expand3} className={'metadata-option'}>
            <FormGroup>
                <Input placeholder={0} value={data.quorum} onChange={(e) => setData({ quorum: parseInt(e.target.value) })} type='number' />
            </FormGroup>
        </SettingsOption>

    </div>
}



export default LifeCycleSubpage