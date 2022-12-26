import { FC, useContext, useMemo } from "react";
import LogoSVG from "../svg/logo";
import * as U from '../../utils'
import BaseCtx from "../../contexts";
import useApi from "../../hooks/use-api";
import axios from "axios";

const Header: FC = () => {

  const { address, step } = useContext(BaseCtx);
  const { api } = useApi(U.C.POLKADOT_NETWORK)
  const _api = useMemo(() => api, [api])

  return (
    <div className="h-header-h flex items-center justify-between px-20 absolute -inset-x-0 top-0">
      <LogoSVG />
      <div className="flex items-center justify-start">
        {
          step === 3
          &&
          <div className="px-4 py-2 bg-gray-1000 rounded-full mr-6 cursor-pointer">
            <div
              className="text-black-1000 text-sm font-semibold"
              onClick={async () => {
                // get tag
                const { data } = await axios.get(`${U.C.API}check/${address}`)
                if (!data.length) {
                  return
                }
                console.log(data)
                const arr: any[] = []
                Object.keys(data[0]).forEach((key) => {
                  if (key !== 'address' && key !== 'id' && key !== 'cliamed' && key !== 'total' && key !== 'uncliam') {
                    arr.push({ name: key, score: data[0][key] })
                  }
                })

                arr.sort((a, b) => {
                  return b.score - a.score;
                })

                console.log(arr)

                const idx = Math.floor(Math.random() * 5)
                const metadata = U.C.IPFS_IMGS[idx]
                const d = `${arr[0].name}-${arr[1].name}-${arr[2].name}`

                const pk = new U.P(address!, _api!)
                await pk.mintToken(metadata, d)

                alert('Mint Success! Please open the extension to view.')
                U.M.default.sendMessageToContent(U.C.ADMETA_MSG_HACKATHON_SOUL, { metadata, label: d })
              }}
            >Mint Your Soul NFT</div>
          </div>
        }
        {
          address
          &&
          <div className="px-4 py-2 bg-gray-1000 rounded-full">
            <div className="text-black-1000 text-sm font-semibold">{U.O.formatAddress(address || '')}</div>
          </div>
        }
      </div>
    </div>
  )
}

export default Header;