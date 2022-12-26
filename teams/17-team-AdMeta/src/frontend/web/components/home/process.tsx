import { FC } from 'react'
import RadioSVG from '../svg/radio';

interface Props {
  step?: number
}

const Process: FC<Props> = ({ step = 1 }) => {
  return (
    <div
      className='flex items-center justify-between relative'
    >
      <div 
        className='absolute bg-black-1020 z-0'
        style={{
          height: '0.188rem',
          left: '3.25rem',
          top: '0.344rem',
          right: '1.75rem'
        }}
      ></div>
      <div className='flex flex-col items-center relative z-10'>
        <RadioSVG isSelect={step === 1} />
        <div className={`${step === 1 ? 'text-white font-bold' : 'text-gray-1010 font-medium'} text-sm mt-2`}>Connect Wallet</div>
      </div>

      <div className='flex flex-col items-center relative z-10'>
        <RadioSVG isSelect={step === 2} />
        <div className={`${step === 2 ? 'text-white font-bold' : 'text-gray-1010 font-medium'} text-sm mt-2`}>Verify</div>
      </div>

      <div className='flex flex-col items-center relative z-10'>
        <RadioSVG isSelect={step === 3} />
        <div className={`${step === 3 ? 'text-white font-bold' : 'text-gray-1010 font-medium'} text-sm mt-2`}>Complete</div>
      </div>

    </div>
  )
}

export default Process;