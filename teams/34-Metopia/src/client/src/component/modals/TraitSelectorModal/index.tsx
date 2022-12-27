import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import { MainButton } from '../../button';
import './index.scss';

const defaultProfileCompleteModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '600px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#25283Bdd',
        border: '0',
        backdropFilter: 'blur(12px)'
    }
}

const TraitList = props => {
    const { field, values, selectedValues, onChange, readonly } = props
    const [expand, setExpand] = useState(false)

    const checkbox = useMemo(() => {
        return <div className='checkbox' style={selectedValues?.length ? { border: 0 } : null} onClick={e => {
            onChange(selectedValues?.length === values?.length ? [] : values)
        }}>
            {
                !selectedValues || selectedValues.length === 0 ? null : (
                    selectedValues.length < values.length ? <img src="https://oss.metopia.xyz/imgs/halfcheckbox.svg" alt=" " /> :
                        <img src="https://oss.metopia.xyz/imgs/checkbox.svg" alt=" " />
                )
            }
        </div>
    }, [values, selectedValues, onChange])

    return <div className={'trait-list' + (readonly ? ' readonly' : '')}>
        <div className='title'>
            <img src="https://oss.metopia.xyz/imgs/triangle.svg" className='triangle' onClick={() => setExpand(!expand)} style={expand ? { transform: 'rotate(90deg)' } : null} />
            {checkbox}
            <div className='value' onClick={() => setExpand(!expand)}>{field}</div>
            <img src="https://oss.metopia.xyz/imgs/close.svg" style={{ height: '16px', marginLeft: 'auto' }} className="del"
                onClick={() => {
                    onChange([])
                }} />
        </div>
        <div className='value-list' style={expand ? {} : { display: 'none' }}>
            {
                values.map((v, i) => {
                    const tmpOnClick = () => {
                        if (selectedValues?.find(sv => sv === v)) {
                            onChange(selectedValues.filter(sv => sv !== v))
                        } else {
                            onChange([...(selectedValues || []), v])
                        }
                    }
                    return <div className='value' key={`value${i}`} >
                        <div className='checkbox' onClick={tmpOnClick}>
                            {selectedValues?.find(sv => sv === v) ?
                                <img src="https://oss.metopia.xyz/imgs/checkbox.svg" /> : null}
                        </div>
                        <div className='text' onClick={tmpOnClick}>{v}</div>
                        <img src="https://oss.metopia.xyz/imgs/close.svg" style={{ height: '16px', marginLeft: 'auto' }} className="del"
                            onClick={() => {
                                onChange(selectedValues.filter(sv => sv !== v))
                            }} />
                    </div>
                })
            }
        </div>
    </div >
}

const TraitSelectorModal = (props: { contract, chainId, show, onChange, traits, value, onHide }) => {
    const { contract, chainId, show, onChange, traits, value, onHide } = props
    const [selectedTraits, setSelectedTraits] = useState<any>({})
    const [attributesList, setAttributesList] = useState<any>(null)

    useEffect(() => {
        if (show) {
            if (Object.keys(selectedTraits).length === 0 && value != null && Object.keys(value).length > 0) {
                setSelectedTraits(value)
            }
        }
    }, [show])
    return <Modal
        appElement={document.getElementById('root')}
        onRequestClose={() => {
            onHide()
            setSelectedTraits({})
        }}
        isOpen={show}
        style={defaultProfileCompleteModalStyle}>
        <div className='trait-selector-modal-container'>
            <div className='head'>
                <div className='text-wrapper'>
                    <div className='text'>Trait selector</div>
                </div>
                <img src="https://oss.metopia.xyz/imgs/close.svg" className='Button' alt="X" onClick={onHide} />
            </div>
            <div className='body'>
                <div className='left'>
                    <div className='title'>Choose traits</div>
                    <div className='search-container'>

                    </div>
                    <div className='trait-tree'>
                        {
                            (attributesList || traits)?.map((t, i) => {
                                return <TraitList field={t.field} values={t.values} key={`TraitList${i}`}
                                    selectedValues={selectedTraits[t.field]}
                                    onChange={val => {
                                        let tmp = Object.assign({}, selectedTraits)
                                        tmp[t.field] = val
                                        setSelectedTraits(tmp)
                                    }} />
                            })
                        }
                    </div>
                </div>
                <img src='https://oss.metopia.xyz/imgs/transfer.svg' />
                <div className='right'>
                    <div className='title'>Selected traits</div>
                    <div className='search-container'>

                    </div>
                    <div className='trait-tree'>
                        {
                            Object.entries(selectedTraits)?.map(([field, traits], i) => {
                                if (!(traits as any[])?.length)
                                    return
                                return <TraitList field={field}
                                    values={traits} key={`TraitList${i}`}
                                    selectedValues={traits} readonly onChange={val => {
                                        let tmp = Object.assign({}, selectedTraits)
                                        tmp[field] = val
                                        setSelectedTraits(tmp)
                                    }}
                                />
                            })
                        }
                        {/* {
                            Object.keys(selectedTraits)?.map((field, i) => {
                                if (!selectedTraits[field]?.length)
                                    return
                                return <TraitList field={field}
                                    values={selectedTraits[field]} key={`TraitList${i}`}
                                    selectedValues={selectedTraits[field]} readonly onChange={val => {
                                        let tmp = Object.assign({}, selectedTraits)
                                        tmp[field] = val
                                        setSelectedTraits(tmp)
                                    }}
                                />
                            })
                        } */}
                    </div>
                </div>
            </div>
            <div className='button-container'>
                <MainButton onClick={() => {
                    onHide()
                    setSelectedTraits({})
                }}>Cancel</MainButton>
                <MainButton onClick={() => {
                    onChange(selectedTraits)
                    setSelectedTraits({})
                }}>Confirm</MainButton>
            </div>
        </div>
    </Modal>
}

export default TraitSelectorModal