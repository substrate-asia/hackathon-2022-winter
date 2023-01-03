import { FC } from "react";
import BaseButton from "../ui/base-button";
import * as U from '../../util'
import browser from "webextension-polyfill";

const Protocol: FC = () => {
  return (
    <div
      className="w-full pl-6 pr-6 overflow-y-auto"
      style={{
        background: 'url(../../assets/bg.png) no-repeat center',
        backgroundSize: 'cover',
        height: '577px',
        paddingTop: '60px'
      }}
    >
      <div className="text-white text-4xl font-semibold mb-4"
      >Welcome!</div>
      <div className="text-white text-sm mb-10"
      >we will collect private access data limited to whitelisted domains in order to analyze it, recommend you precise ads, and make you rewarded 🎁.</div>
      <div
        className="mb-4 p-3 rounded"
        style={{
          background: '#23262F'
        }}
      >
        <div className="text-white text-xs mb-3">WHITELIST</div>
        <div
          className="p-2 rounded overflow-y-auto"
          style={{
            background: '#1D1F26',
            height: '137px'
          }}
        >
          {
            U.WHITE_LIST.products.map((item, index) => (
              <div
                className="text-white text-sm mb-1"
                key={index}
                style={{
                  color: '#3772FF'
                }}
              >{item.domain}</div>
            ))
          }
        </div>
      </div>
      <div className="flex justify-center mb-10">
        <BaseButton
          label="Agree"
          handleClick={async () => {
            U.Helper.goWeb(U.WEP_PAGE)
            browser.storage.local.set({ step: 1 })
          }}
        />
      </div>
    </div>
  )
}

export default Protocol;