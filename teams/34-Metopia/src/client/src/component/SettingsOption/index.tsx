import React, { CSSProperties } from 'react';
import Switch from "react-switch";
import { SingleChoiceButtonGroupV2 } from '../button/SingleChoiceButtonGroupV2';
import './index.scss';

const OptionSwitcher = (props: { onChange, checked, className }) => {
    const { onChange, checked, className } = props
    return <Switch
        width={40}
        height={20}
        handleDiameter={16}
        onChange={onChange} checked={checked}
        className={"react-switch " + className}
    />
}
const SettingsOption = (props: {
    children: JSX.Element, expand: boolean, title, subtitle?, onActive, onDeactive, defaultHeight: number,
    options?: string[],
    className?
}) => {
    const { options, className, expand, title, subtitle, onActive, onDeactive, defaultHeight } = props
    return <div className={'settings-option ' + className + ' ' + (expand ? ' expand' : '')}>
        <div className='head'>
            <div className='text'>
                <div className='title'>{title}</div>
                {
                    subtitle ?
                        <div className='introduction'>{subtitle}</div> : null
                }
                <img src="https://oss.metopia.xyz/imgs/triangle.svg" alt="" className='expand-tip' />
            </div>
            {
                options?.length ?
                    <SingleChoiceButtonGroupV2 defaultOption={expand ? 1 : 0}
                        items={[{ content: options[0] }, { content: options[1] }]}
                        onChange={(index) => {
                            if (index === 0) {
                                onDeactive()
                            } else {
                                onActive()
                            }
                        }} /> : <OptionSwitcher onChange={e => {
                            if (e) {
                                onActive()
                            } else {
                                onDeactive()
                            }
                        }} checked={expand} className={expand ? ' checked' : ''} />
            }

        </div>
        <div className='body' style={expand ? { maxHeight: defaultHeight + 'px' } : { maxHeight: 0 }}>
            <div className='container'  >
                {props.children}
            </div>
        </div>
    </div>
}

export const SettingsSingleChoice = (props: {
    children: JSX.Element,
    checked: boolean,
    title, subtitle?, onActive, onDeactive, defaultHeight: number,
    className?, style?: CSSProperties
}) => {
    const { style, className, checked, title, subtitle, onActive, onDeactive, defaultHeight } = props
    return <div className={'settings-choice ' + className + ' ' + (checked ? ' checked' : null)}
        style={style}>
        <div className='head' onClick={() => {
            if (checked) {
                onDeactive()
            } else {
                onActive()
            }
        }}>
            <div className='text'>
                <div className='title'>{title}</div>
                {
                    subtitle ?
                        <div className='introduction'>{subtitle}</div> : null
                }
                <div className={'checked-tip'}>
                    <img src="https://oss.metopia.xyz/imgs/check_box_on.svg" alt="" className='checked-tip' />
                </div>
            </div>
        </div>
        <div className='body' style={checked ? { maxHeight: defaultHeight + 'px' } : { maxHeight: 0 }}>
            {props.children}
        </div>
    </div >
}

export default SettingsOption