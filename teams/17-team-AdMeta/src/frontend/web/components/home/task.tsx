import { FC, useContext, useRef } from 'react'
import Process from './process';
import Image from 'next/image';
import icon1 from '/public/icon1.png'
import icon2 from '/public/icon2.png'
import icon3 from '/public/icon3.png'
import BaseBtn from '../ui/base-btn';
import * as U from '../../utils'
import BaseCtx from '../../contexts';

import ReCAPTCHA from 'react-google-recaptcha';

const Task: FC = () => {
  const { address, setAddress, step, setStep } = useContext(BaseCtx);
  const recaptchaRef = useRef(null);

  const task1 = () => {
    return <div className='flex flex-col items-center justify-center'>
      <Image
        alt='icon'
        width={64}
        height={64}
        src={icon1.src}
      />
      <div className='text-white font-base font-bold mb-4 mt-4'>Connect Wallet</div>
      <div className='text-gray-1020 text-sm mb-8'>Please connect your polkadot wallet, if you don&apos;t have one you can create one by Polkadot extension, click the <a href='https://polkadot.js.org/extension/' className='text-blue-1000 underline' target='_blank' rel="noreferrer">link</a> to install.</div>
      <BaseBtn
        label='Connect Polkadot'
        handleClick={() => {
          U.O.connectWallet(w => {
            setAddress!(w[0].address)
            setStep!(2)
          })
        }}
      />
    </div>
  }

  const task2 = () => {
    return <div className='flex flex-col items-center justify-center'>
      <Image
        alt='icon'
        width={64}
        height={64}
        src={icon2.src}
      />
      <div className='text-white font-base font-bold mb-4 mt-4'>Verify that you are not a Robot</div>
      <div className='text-gray-1020 text-sm mb-8'>Your Address: {address}</div>
      <ReCAPTCHA
        ref={recaptchaRef}
        size='normal'
        sitekey={U.C.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        onChange={onReCAPTCHAChange}
      />
    </div>
  }

  const onReCAPTCHAChange = async (captchaCode: any) => {
    if (!captchaCode) {
      return;
    }
    setStep!(3)
    U.M.default.sendMessageToContent(U.C.ADMETA_MSG_HACKATHON_ACCOUNT, { address })
  }

  const task3 = () => {
    return <div className='flex flex-col items-center justify-center'>
      <Image
        alt='icon'
        width={64}
        height={64}
        src={icon3.src}
      />
      <div className='text-white font-base font-bold mb-4 mt-4'>Claim rewards</div>
      <div className='text-gray-1020 text-sm mb-8'>Open <a className='text-blue-1000 underline'>Admeta extension</a> to claim your rewards!</div>
    </div>
  }

  return (
    <div
      className='flex justify-center relative'
      style={{
        top: '-5.5rem'
      }}
    >
      <div
        className='w-task-w bg-black-1010 p-task-p'
        style={{
          borderRadius: '.75rem',
          boxShadow: '0px 24px 32px rgba(0, 0, 0, 0.25)'
        }}
      >
        <Process
          step={step}
        />
        <div className='mt-10'>
          {step === 1 && task1()}
          {step === 2 && task2()}
          {step === 3 && task3()}
        </div>
      </div>
    </div>
  )
}

export default Task;