
import React from 'react'
import { FormGroup, Input, Label, NumberInput } from '../../../../../../component/form'
import { StrategyForm } from '../../../../../../core/dao/type'
import { pad } from '../../../../../../utils/stringUtils'
import './index.scss'

const StrategyInput = (props: { data: StrategyForm, onChange, onDelete, displayedId}) => {
    const { data, onChange, onDelete, displayedId  } = props

    return <div className='membership-card-input'>
        <img className='close-button' src="https://oss.metopia.xyz/imgs/colored-close.svg" onClick={onDelete} alt="X" style={onDelete ? null : { display: 'none' }} />
        <div className="head" >
            <div className='text'>Strategy {pad(displayedId, 2)} &nbsp; - &nbsp;{data.name?.length ? data.name : "[Please provide collection ID]"}</div>
            {/* <SingleChoiceButtonGroupV2 defaultOption={mode - 1} items={[{ content: 'Quick mode' }, { content: 'Advanced mode' }]} onChange={(index) => {
                setMode(index + 1)
            }} /> */}
        </div>
        <div className="body">
            <div className="container" >
                <FormGroup style={{ marginBottom: 0 }}>
                    <Label required >Which NFT do you want to use for voting</Label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* <ChainSelector onChange={val => {
                            onChange({
                                chainId: val
                            })
                        }} value={data.chainId} />
                        <img src="https://oss.metopia.xyz/imgs/double-arrow-tran.svg" /> */}
                        <Input value={data.collectionId?.trim() || ""} className={''} placeholder={""}
                            onChange={(e) => {
                                onChange({
                                    name: '',
                                    collectionId: e.target.value.trim(),
                                })
                            }} />
                    </div>
                    <div className="simplemode-hint" ><img src="https://oss.metopia.xyz/imgs/exclaim-gray.svg" />Every NFT in {data.name} has the same voting power</div>
                </FormGroup>
            </div>
            {false ?
                <FormGroup style={{ marginTop: '40px' }}>
                    <Label>Voting Power per token</Label>
                    <NumberInput value={1}
                        onBlur={e => {
                        }}
                        setValue={val => { onChange({ defaultWeight: parseInt(val) }) }} />
                </FormGroup> : null
            }
        </div>
    </div>

}

export default StrategyInput