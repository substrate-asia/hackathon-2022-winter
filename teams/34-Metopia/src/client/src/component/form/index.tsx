import Dropdown from 'rc-dropdown';
import 'rc-dropdown/assets/index.css';
import React, { CSSProperties, useMemo, useRef, useState } from 'react';
import 'react-dropdown/style.css';
import ReactLoading from 'react-loading';
import { toFixedIfNecessary } from '../../utils/numberUtils';
import { WrappedLazyLoadImage } from '../image';
import ImageEditorModal from '../modals/ImageEditorModal';
import './index.scss';
import './r-input.scss';
import './r-label.scss';
import './r-radio-group.scss';
import './r-select.scss';

export const FormGroup = (props: { children, className?, style?: CSSProperties }) => {
    return <div className={`r-form-group ${props.className}`} style={props.style}>
        {props.children}
    </div>
}

export const Label = (props) => {
    const { required } = props
    return <div className={'r-label ' + (props.className ? props.className : "") + (required ? ' required' : '')}
        style={props.style}  >
        {props.children}
        {
            required ? <div className='required'>*</div> : null
        }

    </div>
}

export const Tip = (props) => {
    return <div className={'r-tip ' + (props.className ? props.className : "")}
        style={props.style}  >{props.children}</div>
}

export const Input = (props) => {
    const { loading, type, error, maxLength } = props
    const [focused, setFocused] = useState(false)
    const [localError, setLocalError] = useState(null)
    const [len, setLen] = useState(props.value?.length || 0)
    return <div className={'r-input ' + (props.className ? props.className : "") +
        (type === 'number' ? ' number' : '') + (focused ? ' focused' : '')
        + (error?.length ? ' error' : '')}>
        <div className='container'>
            <input  {...props} onFocus={e => {
                setFocused(true)
                props.onFocus && props.onFocus(e)
            }} onBlur={e => {
                setFocused(false)
                props.onBlur && props.onBlur(e)
            }} onChange={e => {
                setLen(e.target.value.length)
                props.onChange && props.onChange(e)
            }} />
        </div>
        {loading ? <ReactLoading className="loading" type={'spokes'} color={'#ddd'} height={'20px'} width={'20px'} /> : null}

        {
            error?.length ? <div className='Error'>{error}</div> : null
        }
        {
            maxLength ? <div className='len-indicator'>{len}/{maxLength}</div> : null
        }
    </div>
}

export const NumberInput = (props: {
    value: number, setValue, defaultValue?: number, className?, step?: number, percent?: boolean, onBlur?,
    maxValue?: number, minValue?: number
}) => {
    const { maxValue, minValue, step, value, defaultValue, setValue, className, percent, onBlur } = props
    const [focused, setFocused] = useState(false)

    const add = () => {
        if (!maxValue || maxValue >= value + (step || 1)) {
            setValue(parseFloat(value + '') + (step || 1))
        } else {
            setValue(maxValue)
        }
    }

    const subtract = () => {
        if (!minValue || minValue < value - (step || 1)) {
            setValue(parseFloat(value + '') - (step || 1))
        } else {
            setValue(minValue)
        }
    }

    return <div className={'r-number-input ' + (className ? className : "") + (percent ? " percent" : '') + (focused ? ' focused' : '')}>
        <div className='subtract-button' onClick={subtract}><img src="https://oss.metopia.xyz/imgs/subtract-icon.svg" alt="Subtract" /></div>
        <div className='input-wrapper'>
            <input type="number" value={value} onChange={e => {
                if (!e.target.value.length)
                    setValue(null)
                else {
                    if (maxValue && parseInt(e.target.value) > maxValue) {
                        setValue(maxValue.toString())
                    } else if (minValue && parseInt(e.target.value) < minValue) {
                        setValue(minValue.toString())
                    } else {
                        setValue(e.target.value)
                    }
                }
            }} onFocus={e => {
                setFocused(true)
            }} onBlur={e => {
                setFocused(false)
                if (!e.target.value.length)
                    setValue(defaultValue || 0)
                onBlur && onBlur(e)
            }} />
        </div>
        <div className='add-button' onClick={add} ><img src="https://oss.metopia.xyz/imgs/plus-icon.svg" alt="Add" /></div>
    </div>
}

export const Textarea = (props) => {
    const { disabled } = props
    const [len, setLen] = useState(0)
    const [focused, setFocused] = useState(false)
    return <div className={'r-textarea ' + (props.className ? props.className : "") +
        (disabled ? ' disabled' : "") + (focused ? ' focused' : '')}>
        <textarea
            disabled={disabled}
            maxLength={props.maxLength}
            placeholder={props.placeholder}
            style={props.style}
            onChange={(e) => {
                if (disabled)
                    return
                setLen(e.target.value.length)
                props.onChange && props.onChange(e)
            }} defaultValue={props.defaultValue} value={props.value} onFocus={e => {
                setFocused(true)
            }} onBlur={e => {
                setFocused(false)
            }} ></textarea>
        {
            props.maxLength ? <div className={"length-indicator" + (len > props.maxLength ? ' exceeded' : '')}>{len}/{props.maxLength}</div> : null
        }
    </div>
}

export const ImageSelector = (props: { imgUrl, onChange: { (files: FileList): any }, style?: CSSProperties, size?, wide?}) => {
    const inputRef = useRef<any>()
    const [loading, setLoading] = useState(false)
    let sizeClass = props.size ? ' ' + props.size : ''
    return <div className={"r-image-uploader " + (props.wide ? 'wide' : 'square') + sizeClass} style={props.style}>
        <div className={"mask" + (props.imgUrl?.length ? '' : ' empty')} onClick={() => {
            if (loading)
                return
            inputRef.current.click()
        }}>
            {props.imgUrl?.length ? <WrappedLazyLoadImage className="selected-image" src={props.imgUrl} alt='' /> :
                <img className={"to-upload-icon" + (loading ? ' hidden' : '')} src={"https://oss.metopia.xyz/imgs/uploadv2.svg"} alt='Upload' />}
        </div>
        {
            loading ? <ReactLoading type={'spin'} color={'#444'} height={'40%'} width={'40%'} className="loading" /> : null
        }
        <input type='file' className="Hidden" ref={inputRef}
            onChange={async (e) => {
                setLoading(true)
                try {
                    await props.onChange(e.target.files)
                } catch {
                    props.onChange(null)
                    inputRef.current.value = ""
                } finally {
                    setLoading(false)
                }
            }}
            accept='image/*' />
    </div >
}


export const CroppingImageSelector = (props: { imgUrl, onChange, style?: CSSProperties, size?, wide?, width?, height?, croppingWidth?, croppingHeight?}) => {
    const { onChange, wide, width, height, croppingWidth, croppingHeight } = props
    const [showModal, setShowModal] = useState(false)
    let sizeClass = props.size ? ' ' + props.size : ''
    let style = width && height ? Object.assign({}, props.style, { width: width + 'px', height: height + 'px' }) : props.style
    return <div className={"r-image-uploader " + (props.wide ? 'wide' : 'square') + sizeClass} style={style}>
        <div className={"mask" + (props.imgUrl?.length ? '' : ' empty')} onClick={() => {
            setShowModal(true)
        }}>
            {props.imgUrl?.length ? <WrappedLazyLoadImage className="selected-image" src={props.imgUrl} alt='' /> :
                <img className={"to-upload-icon"} src={"https://oss.metopia.xyz/imgs/uploadv2.svg"} alt='Upload' />}
        </div>
        <ImageEditorModal isShow={showModal} onSubmit={onChange} width={croppingWidth} height={croppingHeight} onRequestClose={() => setShowModal(false)} />
    </div >
}

// export const Select = (props: { options: { value: any, text: any }[], onChange?, defaultValue?}) => {
//     const { options, onChange, defaultValue } = props
//     if (!options || options.length === 0)
//         return null
//     return <select className="r-select" onChange={onChange} defaultValue={defaultValue}>
//         {
//             options.map(op => {
//                 return <option key={"option-" + op.value} value={op.value} className="r-option">{op.text}</option>
//             })
//         }
//     </select>
// }

export const SelectWithKeywordInput = (props: {
    keyword?,
    options: { value: any, text: any, ele?}[],
    onChange: ({ value, text }) => any,
    style?: CSSProperties,
    upwards?
}) => {
    const { style, options, onChange, upwards } = props
    const [display, setDisplay] = useState(false)
    const [keyword, setKeyword] = useState(props.keyword || '')
    if (!options || options.length === 0)
        return null
    const options2 = [
        'one', 'two', 'three'
    ]

    return <div className={"r-select-v2"} style={style}>
        <Input onFocus={e => setDisplay(true)}
            value={keyword}
            onChange={e => { setKeyword(e.target.value) }}
            onBlur={e => {
                setTimeout(() => {
                    setDisplay(false)
                }, 100);
            }} />

        <div className={'drop-down-pane' + (display ? ' display' : '') + (upwards ? ' upwards' : '')}>
            {
                options.filter(op => op.text.indexOf(keyword) > -1 || op.value === keyword).map((op, i) => {
                    return <div key={"option-" + i} className="option" onClick={e => {
                        onChange(op)
                        setKeyword(op.text)
                        return false
                    }}>{op.ele || op.text}</div>
                })
            }
        </div>
    </div>
}


export const MultiSelectV2 = (props: {
    value?: any[],
    options: { value: any, text: any, ele?}[],
    onChange,
    style?: CSSProperties,
    upwards?
}) => {
    const { options, onChange, style, value, upwards } = props
    const [display, setDisplay] = useState(false)
    const [localValue, setLocalValue] = useState(value || [])
    // const dropdownListener = useRef(null)
    if (!options || options.length === 0)
        return null

    // useEffect(() => {
    //     if(display&&!dropdownListener){
    //         dropdownListener.current = (e)=>{

    //         }
    //         window.onclic
    //     }
    // }, [display, dropdownListener])


    return <div style={style} className="r-multi-select-v2">
        <Dropdown
            trigger={['click']}
            overlay={<></>}
            onVisibleChange={e => {
                if (e) {
                    setDisplay(e);
                }
                else {
                    setTimeout(() => {
                        setDisplay(e);
                    }, 100);
                }
            }}
        >
            <div className="value-container" onClick={() => setDisplay(true)}>
                {
                    (value || localValue).map((val, i) => {
                        let option = options.find(op => op.value === val)
                        return <div className='value-card' key={`value-card-${i}`}>
                            <div>{option.text}</div>
                            <img src="https://oss.metopia.xyz/imgs/close-p.svg" alt="X" onClick={e => {
                                let tmp = (value || localValue).filter(tmpVal => tmpVal !== val)
                                onChange(tmp)
                                setLocalValue(tmp)
                                e.stopPropagation()
                            }} /></div>
                    })
                }
            </div>
        </Dropdown>

        <div className={'drop-down-pane' + (display ? ' display' : '') + (upwards ? ' upwards' : '')}>
            {
                options.filter(op => !(value || localValue).find(tmpVal => tmpVal === op.value)).map((op, i) => {
                    return <div key={"option-" + i} className="option" onClick={e => {
                        setLocalValue([...(value || localValue), op.value])
                        onChange([...(value || localValue), op.value])
                        return false
                    }}>{op.ele || op.text}</div>
                })
            }
        </div>
    </div>
}


export const Select = (props: { options: { text, value: any }[], onChange, value?, style?: CSSProperties, defaultValue?, className?, invalidOption?}) => {
    const { options, defaultValue, onChange, className, style, value, invalidOption } = props
    const [display, setDisplay] = useState(false)
    const [tmpValue, setTmpValue] = useState(value || defaultValue)
    if (!options || options.length === 0)
        return null
    const val = value || tmpValue

    return <div className={'simple-select ' + className} defaultValue={defaultValue} style={style}>
        <div onFocus={e => setDisplay(true)} onBlur={e => {
            setTimeout(() => {
                setDisplay(false)
            }, 100);
        }}>
            <Dropdown
                trigger={['click']}
                overlay={<></>}
                animation="slide-up"
                onVisibleChange={e => {
                    if (e)
                        setDisplay(e);
                    else {

                    }
                }}
            >
                <button className='Button'>{value ? (options.find(op => op.value == value)?.text ? options.find(op => op.value == value).text : (invalidOption || "Invalid")) : "Invalid"}</button>
            </Dropdown>
        </div>
        <div className={'drop-down-pane' + (display ? ' display' : '')}>
            {
                options.map(op => {
                    return <div key={"option-" + op.value} className="option" onClick={e => {
                        setTmpValue(op.value)
                        onChange(op.value)
                    }}>{op.text}</div>
                })
            }</div>
    </div >
}


export const MultiSelect = (props: { options, value?, onChange?, style?, defaultValue?}) => {
    const { options, onChange, style, value, defaultValue } = props
    const [selectedOptions, setSelectedOptions] = useState(defaultValue || [])
    if (!options || options.length === 0)
        return null

    return <div style={style} className="r-multi-select">
        {(value || selectedOptions).length > 0 ?
            <div className="card-wrapper">
                {
                    (value || selectedOptions).map((sop, i) => {
                        return <div className='card' key={'r-multi-select-card' + i}>
                            <span>{sop.text}</span>
                            <img src="https://oss.metopia.xyz/imgs/close.svg" alt="" onClick={e => {
                                let tmp = (value || selectedOptions).filter(op => op.value !== sop.value)
                                onChange(tmp)
                                setSelectedOptions(tmp)
                            }} /></div>
                    })
                }
            </div> :
            null}
        <select className="selector" onChange={e => {
            setSelectedOptions([...(value || selectedOptions), options.find(op => op.value === e.target.value)])
            onChange([...(value || selectedOptions), options.find(op => op.value === e.target.value)])
        }}>
            {
                options.filter(op => !(value || selectedOptions).find(sop => sop.value === op.value)).map(op => {
                    return <option key={"option-" + op.value} value={op.value} className="r-option" onClick={() => {
                        setSelectedOptions([...(value || selectedOptions), op])
                        onChange([...(value || selectedOptions), op])
                    }}>{op.text}</option>
                })
            }
        </select>
    </div>
}

export const UNIT_SECOND = 1
export const UNIT_HOUR = 3600
export const UNIT_DAY = 86400
export const UNIT_MONTH = 2592000
export const UNIT_YEAR = 31104000

export const suitablePeriodUnit = (num) => {
    let res = 'seconds'
    if (num >= 3600)
        res = 'hours'
    if (num >= 86400)
        res = 'days'
    if (num >= 2592000)
        res = 'months'
    if (num >= 31104000)
        res = 'years'
    return res
}

export const unitNumToText = (num) => {
    if (num === 1)
        return 'seconds'
    else if (num === 3600)
        return 'hours'
    else if (num === 86400)
        return 'days'
    else if (num === 2592000)
        return 'months'
    else if (num === 31104000)
        return 'years'
    return ''
}
export const unitTextToNum = (text) => {
    if (!text)
        return 0
    if (text.indexOf('second') === 0)
        return 1
    else if (text.indexOf('hour') === 0)
        return 3600
    else if (text.indexOf('day') === 0)
        return 86400
    else if (text.indexOf('month') === 0)
        return 2592000
    else if (text.indexOf('year') === 0)
        return 31104000
}

export const DurationInput = (props: { onChange, value, onChangeUnit, unit: number, defaultValue?: number, style?: CSSProperties, placeholder?: number, unitRange?: number[] }) => {
    const { placeholder, value, onChange, unit, unitRange, style, defaultValue } = props
    const options = useMemo(() => {
        return (unitRange || [1, 3600, 86400]).map(num => {
            return <option value={num} key={"duration-input" + num}>{unitNumToText(num)}</option>
        })
    }, [unitRange])

    return <div className="r-input-duration" style={style}>
        <div className='container'>
            <Input placeholder={placeholder} type='number'
                value={value == null ? '' : toFixedIfNecessary(value / unit, 2)}
                onChange={e => {
                    if (!e.target.value.length) {
                        onChange(null)
                        return
                    }
                    let tmpVal = parseFloat(e.target.value)
                    if (tmpVal >= 0) {
                        onChange(tmpVal * unit)
                    } else {
                        onChange(0)
                    }
                }} onBlur={e => {
                    if (!e.target.value.length) {
                        onChange(defaultValue || 0)
                    }
                }} />
            <Select options={[1, 3600, 86400].map(num => {
                return { text: unitNumToText(num), value: num }
            })}
                value={unit}
                onChange={unit => {
                    let tmpUnit = parseInt(unit)
                    onChange(Math.round(value * unit / tmpUnit))
                    props.onChangeUnit && props.onChangeUnit(tmpUnit)
                }} defaultValue={86400} />
            {/* <select onChange={e => {
                let tmpUnit = parseInt(e.target.value)
                onChange(Math.round(value * unit / tmpUnit))
                props.onChangeUnit && props.onChangeUnit(tmpUnit)
            }} className='' value={unit} >
                {options}
            </select> */}
        </div>
    </div>
}

export const RadioGroup = (props: { value?: number, options: string[], onChange }) => {
    const { value, options, onChange } = props
    const [selected, setSelected] = useState(value || 0)
    return <div className='r-radio-group'>
        {
            options.map((op, i) => {
                return <div className='radio' key={`radio-${i}`} onClick={() => {
                    setSelected(i)
                    onChange(i)
                }}>
                    <div className='symbol'>
                        <img src="https://oss.metopia.xyz/imgs/check_box_on.svg" style={i === (value == null ? selected : value) ? null : { display: 'none' }} />
                    </div>
                    <div className='text'>{op}</div>
                </div>
            })
        }
    </div>
}

