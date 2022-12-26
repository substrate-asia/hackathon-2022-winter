import Image from 'next/image';
import { FC } from 'react'
import BaseTag from '../ui/base-tag';

import project1 from '/public/project1.png'
import project2 from '/public/project2.png'

interface BG {
  [key: string]: string
}

const bgs: BG = { DeFi: '#58BD7D', Identity: '#2151F5', Privacy: '#F58721' }

const projects = [
  {
    img: project1.src,
    name: 'Litentry',
    tags: ['DeFi', 'Identity', 'Privacy'],
    dec: 'Litentry is a Decentralized Identity Aggregation protocol across multiple networks. It features a DID indexing mechanism and a Substrate-based credit computation network. The protocol provides a decentralized, interoperable identity aggregation service that mitigates the difficulty of resolving agnostic DID mechanisms.......'
  },
  {
    img: project2.src,
    name: 'Acala',
    tags: ['DeFi'],
    dec: 'Acala is the all-in-one DeFi hub of Polkadot. Acala is an Ethereum-compatible platform for financial applications to use smart contracts or built-in protocols with out-of-the-box cross-chain capabilities and robust security. The platform also offers a suite of financial  applications including: a trustless staking derivative (liquid DOT), a multi-collateralized...'
  },
]

const Popular: FC = () => {
  return (
    <div
      className='px-20 mb-20'
    >
      <div className='text-white text-sm font-semibold mb-6'>More popular project on Web3:</div>
      <div className='flex flex-wrap justify-items-start justify-between'>
        {
          projects.map((item, index) => (
            <div
              key={index}
              className='p-4 bg-black-1010 flex items-start  mb-4'
              style={{
                width: '49%'
              }}
            >
              <Image
                src={item.img}
                alt=''
                width={64}
                height={64}
              />
              <div className='ml-6'>
                <div className='text-white font-base font-bold mb-4'>{item.name}</div>
                <div className='mb-6 flex'>
                  {
                    item.tags.map((item, idx) => (
                      <><BaseTag key={idx} label={item} bg={bgs[item]} /><div className='mr-2'></div></>
                    ))
                  }
                </div>
                <div className='text-gray-1020 font-sm'>{item.dec}</div>
              </div>
            </div>
          ))
        }

      </div>
    </div>
  )
}

export default Popular;