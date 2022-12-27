import React, { useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import { StandardAvatar, WrappedLazyLoadImage } from '../../image';
import { thumbnail } from '../../../config/urls';
import { useAccountData } from '../../../core/accountApiHooks';
import './index.scss';


const UserInput = props => {
    const { value, onChange, onDelete, onAdd, short } = props
    let debounced = useDebounce(value, 300)
    const { data: accountData } = useAccountData(debounced, 1)
    const [focused, setFocused] = useState(false)
    
    return <div className={'user-input' + (focused ? ' focused' : '') + (value?.length ? ' not-empty' : '') + (short ? ' short' : '')}>
        <div className='input-wrapper'>
            <div className='user-info' style={!value?.length ? { display: 'none' } : null}>
                <div className={'avatar-wrapper' + (accountData?.avatar ? "" : ' default')}>
                    <StandardAvatar user={accountData} height={32}/>
                    {/* {
                        accountData?.avatar ? <WrappedLazyLoadImage className="avatar" src={thumbnail(accountData?.avatar, 32, 32)} alt="" /> :
                            <img className={'default avatar'} src={"https://oss.metopia.xyz/imgs/default-avatar.png"} alt="" />
                    } */}
                </div>
                <div className='name'>{accountData?.username || "New user"}</div>
            </div>
            <input placeholder='Please enter the EVM address (0x...)' value={value} onChange={e => onChange(e.target.value)}
                style={value?.length ? { borderLeft: '1px solid #7D809A' } : null}
                onFocus={e => {
                    setFocused(true)
                }} onBlur={e => {
                    setFocused(false)
                }} />
        </div>
        <div className='button-wrapper'>
            <img src="https://oss.metopia.xyz/imgs/plus-icon-round.svg" alt="Add" onClick={onAdd} />
            <img src="https://oss.metopia.xyz/imgs/subtract-icon-round.svg" alt="Delete" onClick={onDelete} style={onDelete ? null : { display: 'none' }} />
        </div>
    </div>
}

export default UserInput