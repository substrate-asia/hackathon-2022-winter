import React, { useState } from "react"
import { WrappedLazyLoadImage } from "."
import { thumbnail } from "../../config/urls"
import { fillZero } from "../../utils/stringUtils"
import './DefaultAvatar.scss'

const getRandomColor = wallet => {
    let rhex = wallet.substring(2, 6)
    let ghex = wallet.substring(12, 6)
    let bhex = wallet.substring(22, 6)
    let r = parseInt(`${rhex}`, 36) % 200 + 55
    let g = parseInt(`${ghex}`, 36) % 200 + 55
    let b = parseInt(`${bhex}`, 36) % 200 + 55

    return `#${fillZero(r.toString(16))}${fillZero(g.toString(16))}${fillZero(b.toString(16))}`
}

const getRandomRGB1 = wallet => {
    let rhex = wallet.substring(2, 6)
    let ghex = wallet.substring(12, 6)
    let bhex = wallet.substring(22, 6)
    let r = parseInt(`${rhex}`, 36) % 200 + 55
    let g = parseInt(`${ghex}`, 36) % 200 + 55
    let b = parseInt(`${bhex}`, 36) % 200 + 55

    return { r, g, b }
}
const getRandomRGB2 = wallet => {
    let rhex = wallet.substring(3, 6)
    let ghex = wallet.substring(13, 6)
    let bhex = wallet.substring(23, 6)
    let r = parseInt(`${rhex}`, 36) % 200 + 55
    let g = parseInt(`${ghex}`, 36) % 200 + 55
    let b = parseInt(`${bhex}`, 36) % 200 + 55

    return { r, g, b }
}

export const DefaultAvatar = (props: { wallet, height?, className?}) => {
    const { wallet, className, height } = props
    if (!wallet || wallet.length < 40)
        return null
    let color = getRandomColor(wallet)
    // return <svg width="23" height="30" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || ''}>
    //     <mask id="mask0_789_4520" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="23" height="30">
    //         <path fillRule="evenodd" clipRule="evenodd" d="M8.29828 6.96138C8.65995 6.64134 9.03723 6.3213 9.43273 6.00646C14.9879 1.58052 20.9074 0.339388 21.1572 0.287348C21.4252 0.232707 21.7036 0.300358 21.9143 0.47469C22.1251 0.64642 22.25 0.906614 22.25 1.17982V28.8205C22.25 29.3227 21.8415 29.7312 21.3393 29.7312H4.99182C4.57761 29.7312 4.24182 29.3954 4.24182 28.9812V27.9098L4.24182 20.7206C3.8229 20.6503 3.31031 20.5124 2.78472 20.2496C1.60082 19.6564 0.843657 18.7249 0.812434 18.6858C0.596471 18.4152 0.549632 18.0457 0.695342 17.7309L0.867072 17.3562L0.87082 17.348C1.67895 15.5779 3.38092 11.8501 6.97128 8.21553C10.5672 4.57539 7.9366 7.28143 8.29828 6.96138Z" fill={color} />
    //     </mask>
    //     <g mask="url(#mask0_789_4520)">
    //         <path fillRule="evenodd" clipRule="evenodd" d="M8.29828 6.96138C8.65995 6.64134 9.03723 6.3213 9.43273 6.00646C14.9879 1.58052 20.9074 0.339388 21.1572 0.287348C21.4252 0.232707 21.7036 0.300358 21.9143 0.47469C22.1251 0.64642 22.25 0.906614 22.25 1.17982V28.8205C22.25 29.3227 21.8415 29.7312 21.3393 29.7312H4.99182C4.57761 29.7312 4.24182 29.3954 4.24182 28.9812V27.9098L4.24182 20.7206C3.8229 20.6503 3.31031 20.5124 2.78472 20.2496C1.60082 19.6564 0.843657 18.7249 0.812434 18.6858C0.596471 18.4152 0.549632 18.0457 0.695342 17.7309L0.867072 17.3562L0.87082 17.348C1.67895 15.5779 3.38092 11.8501 6.97128 8.21553C10.5672 4.57539 7.9366 7.28143 8.29828 6.96138Z" fill={color} />
    //         <path fillRule="evenodd" clipRule="evenodd" d="M13.6064 14.826C15.0458 15.1647 16.4873 14.2723 16.826 12.8329C17.1647 11.3935 16.2723 9.952 14.8329 9.61331C13.3935 9.27462 11.952 10.167 11.6133 11.6064C11.2746 13.0458 12.167 14.4873 13.6064 14.826ZM13.3201 12.9249C13.7999 13.0378 14.2804 12.7403 14.3933 12.2605C14.5062 11.7807 14.2087 11.3002 13.7289 11.1873C13.2491 11.0744 12.7686 11.3719 12.6557 11.8517C12.5428 12.3315 12.8403 12.812 13.3201 12.9249Z" fill="white" />
    //         <path d="M4.26831 26.8613C3.77393 26.8613 3.36803 26.4632 3.35762 25.9662C3.34721 25.464 3.74791 25.0477 4.25009 25.0399C4.30473 25.0399 6.93271 24.967 9.89895 23.8716C10.3699 23.6973 10.8955 23.9393 11.0698 24.4102C11.2442 24.8812 11.0022 25.4068 10.5312 25.5811C7.24756 26.7936 4.40621 26.8587 4.28652 26.8613C4.27872 26.8613 4.27351 26.8613 4.26831 26.8613Z" fill="white" />
    //     </g>
    // </svg >

    return <div className="default-avatar"><svg style={{ transform: height ? `scale(${height / 40})` : 'none' }} width="21" height={"18"} viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg"  >
        <path fillRule="evenodd" clipRule="evenodd" d="M0.556929 18H20.3197C20.6265 18 20.8761 17.7504 20.8761 17.4436V0.556551C20.8761 0.389636 20.7998 0.23067 20.671 0.125752C20.5423 0.0192441 20.3722 -0.0220875 20.2084 0.0112955C20.0558 0.0430889 16.4393 0.801361 13.0454 3.50539C12.8037 3.69774 12.5732 3.89327 12.3523 4.0888C11.7832 3.57851 10.6036 2.62312 8.81368 1.67091C6.07785 0.214774 3.43264 0.0112951 3.32137 0.00334671C3.05112 -0.0157293 2.80472 0.163902 2.74113 0.429377L0.0148559 11.8098C-0.0217065 11.964 0.0100834 12.1278 0.100695 12.2581C0.192895 12.3885 0.335971 12.4743 0.493348 12.4918L1.33746 12.5888L0.0212111 17.2942C-0.026479 17.4627 0.00849641 17.6423 0.113415 17.7806C0.218333 17.9189 0.383655 18 0.556929 18ZM19.7633 16.8872H10.9883V16.2105C11.6673 16.1457 12.9001 15.9653 14.2565 15.4645C14.5442 15.358 14.692 15.0369 14.5855 14.7491C14.479 14.4614 14.1579 14.3136 13.8702 14.4201C12.7016 14.8516 11.6189 15.0234 10.9883 15.091V12.1214C11.0011 12.0705 11.0074 12.0165 11.0058 11.9608C10.9947 11.6604 10.7499 11.4235 10.4495 11.4235H10.432C10.4161 11.4235 10.4018 11.4235 10.3875 11.4251C10.2841 11.4283 9.88671 11.414 9.48293 11.2121C9.23335 11.0865 9.02352 10.9228 8.87727 10.7893C9.5036 9.41896 10.7817 6.73083 13.7401 4.37494C16.0848 2.50708 18.5965 1.61686 19.7633 1.27667V16.8872ZM2.0779 14.0678C2.12003 14.0865 2.16523 14.1003 2.2129 14.1083L2.21472 14.1086C2.28035 14.1201 3.99059 14.4206 5.22055 15.1289C5.30798 15.1797 5.40336 15.2036 5.49715 15.2036C5.6895 15.2036 5.87709 15.1034 5.98042 14.9254C6.13462 14.6583 6.04241 14.3181 5.77535 14.1655C4.351 13.3452 2.47678 13.0241 2.3973 13.0114C2.38956 13.0101 2.38184 13.009 2.37414 13.008L2.0779 14.0678Z" fill={color} />
        <mask id="mask0_187_9145" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="21" height="18">
            <path fillRule="evenodd" clipRule="evenodd" d="M0.556929 18H20.3197C20.6265 18 20.8761 17.7504 20.8761 17.4436V0.556551C20.8761 0.389636 20.7998 0.23067 20.671 0.125752C20.5423 0.0192441 20.3722 -0.0220875 20.2084 0.0112955C20.0558 0.0430889 16.4393 0.801361 13.0454 3.50539C12.8037 3.69774 12.5732 3.89327 12.3523 4.0888C11.7832 3.57851 10.6036 2.62312 8.81368 1.67091C6.07785 0.214774 3.43264 0.0112951 3.32137 0.00334671C3.05112 -0.0157293 2.80472 0.163902 2.74113 0.429377L0.0148559 11.8098C-0.0217065 11.964 0.0100834 12.1278 0.100695 12.2581C0.192895 12.3885 0.335971 12.4743 0.493348 12.4918L1.33746 12.5888L0.0212111 17.2942C-0.026479 17.4627 0.00849641 17.6423 0.113415 17.7806C0.218333 17.9189 0.383655 18 0.556929 18ZM19.7633 16.8872H10.9883V16.2105C11.6673 16.1457 12.9001 15.9653 14.2565 15.4645C14.5442 15.358 14.692 15.0369 14.5855 14.7491C14.479 14.4614 14.1579 14.3136 13.8702 14.4201C12.7016 14.8516 11.6189 15.0234 10.9883 15.091V12.1214C11.0011 12.0705 11.0074 12.0165 11.0058 11.9608C10.9947 11.6604 10.7499 11.4235 10.4495 11.4235H10.432C10.4161 11.4235 10.4018 11.4235 10.3875 11.4251C10.2841 11.4283 9.88671 11.414 9.48293 11.2121C9.23335 11.0865 9.02352 10.9228 8.87727 10.7893C9.5036 9.41896 10.7817 6.73083 13.7401 4.37494C16.0848 2.50708 18.5965 1.61686 19.7633 1.27667V16.8872ZM2.0779 14.0678C2.12003 14.0865 2.16523 14.1003 2.2129 14.1083L2.21472 14.1086C2.28035 14.1201 3.99059 14.4206 5.22055 15.1289C5.30798 15.1797 5.40336 15.2036 5.49715 15.2036C5.6895 15.2036 5.87709 15.1034 5.98042 14.9254C6.13462 14.6583 6.04241 14.3181 5.77535 14.1655C4.351 13.3452 2.47678 13.0241 2.3973 13.0114C2.38956 13.0101 2.38184 13.009 2.37414 13.008L2.0779 14.0678Z" fill={color} />
        </mask>
        <g mask="url(#mask0_187_9145)">
        </g>
    </svg>
    </div>
}

export const DefaultAvatarWithRoundBackground = (props: { wallet, height?: number, className?}) => {
    const { wallet, height, className } = props
    if (!wallet || wallet.length < 40)
        return <div style={{
            backgroundColor: '#00000044',
        }} className={'default-avatar-with-round-background ' + (className || '')}>
        </div>
    let { r: r1, g: g1, b: b1 } = getRandomRGB1(wallet)
    let { r: r2, g: g2, b: b2 } = getRandomRGB2(wallet)

    return <div className={'default-avatar-with-round-background ' + (className || '')} style={{
        background: `linear-gradient(135deg, rgba(${r1},${g1},${b1}),rgba(${r2},${g2},${b2}))`,
        // transform: height ? `scale(${height / 40})` : 'none',
        width: (height || 40) + 'px',
        height: (height || 40) + 'px',
    }}>
        <div className="default-avatar-wrapper">
            <DefaultAvatar wallet={wallet} height={height} />
        </div>
    </div>
}

export const StandardAvatar = (props: { user, height: number, className?}) => {
    const { user, height, className } = props

    const [srcError, setSrcError] = useState(null)
    if (!user)
        return null
    if (user.avatar) {
        return <WrappedLazyLoadImage
            style={{ borderRadius: '50%', height: height + 'px', width: height + 'px' }}
            className={className}
            src={!srcError || srcError?.indexOf('metopia') == -1 ? thumbnail(user.avatar, height, height) : user.avatar}
            alt=""
            onError={setSrcError} />
    } else {
        return <DefaultAvatarWithRoundBackground wallet={user.owner} className="default" height={height} />
    }
}