import ReactDOM from 'react-dom';
import { FC, useEffect, useState } from "react";
import browser from 'webextension-polyfill'
import Header from '../components/header';
import Protocol from '../components/protocol';
import Claim from '../components/claim';
import Dashboard from '../components/dashboard';
import * as U from '../util'

import './style.css'

const Popup: FC = () => {
  const [address, setAddress] = useState('')
  const [step, setStep] = useState<number>(0)

  useEffect(() => {
    browser.storage.local.get(['address', 'step']).then(({ address, step }) => {
      setAddress(address)
      setStep(step)
      browser.storage.local.set({ step })
    });
  }, [])

  return (
    <div className='w-body-w'>
      <Header />
      {
        step === 0 || step === undefined
        &&
        <Protocol />
      }
      {
        step === 1
        &&
        <Claim
          handClaim={async () => {
            browser.storage.local.set({ step: 2 })
            setStep(2)
            const r = await U.Helper.apiCall({ method: 'GET', URI: `hackathon/check/${address}` })
            if (!r.length) {
              const params = {
                address,
                DeFi: 0,
                GameFi: 0,
                NFT: 0,
                Metaverse: 0,
                OnChainData: 0,
                total: 20,
                uncliam: 20,
                cliamed: 2
              }
              // add new user
              await U.Helper.apiCall({
                method: 'POST',
                URI: `hackathon/add`,
                params
              })
            }
          }}
        />
      }
      {
        step === 2
        &&
        <Dashboard
          address={address}
        />
      }
    </div>
  )
}

ReactDOM.render(<Popup />, document.getElementById('popup'));