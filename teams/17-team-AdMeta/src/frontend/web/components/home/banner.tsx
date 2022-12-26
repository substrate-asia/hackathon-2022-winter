import { FC } from 'react'
import PolkadotSVG from '../svg/polkadot';
import bg from '/public/banner-bg.png'

const Banner: FC = () => {
  return (
    <div
      className='h-banner-h bg-cover bg-no-repeat flex flex-col items-center justify-center '
      style={{
        backgroundImage: `url(${bg.src})`
      }}>
      <div className='flex items-center justify-center mb-4'>
        <div className='text-banner-t text-white font-semibold mr-4'>Welcome to</div>
        <PolkadotSVG />
        <div className='text-banner-t text-white font-semibold ml-4'>World</div>
      </div>
      <div className='text-white text-base'>Complete below tasks to get rewards</div>
    </div>
  )
}

export default Banner;