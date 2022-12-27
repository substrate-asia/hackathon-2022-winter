
import React, { CSSProperties } from 'react';
import Switch from "react-switch";
import './index.scss'
const OptionSwitcher = (props: { onChange, checked, className?, disabled?}) => {
    const { onChange, checked, className, disabled } = props
    return <Switch
        disabled={disabled}
        width={40}
        height={20}
        handleDiameter={16}
        onChange={onChange} checked={checked}
        className={"react-switch " + (checked ? ' checked ' : '') + (className || "")}
    />
}

export default OptionSwitcher