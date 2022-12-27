import { useMemo } from "react";
import useSWR from "swr";
import { moralisApiToken } from '../../../config/constant';
import { useWallet } from "../../../config/redux";
const fetcher = (url, token) => fetch(url, {
    headers: {
        'x-api-key': token
    }
}).then((res) => res.json())

const useFungibles = (address?, chainId?) => {

    const [wallet] = useWallet()
    const [account, defaultChainId] = [wallet?.address, '0xzzzz']
    const { data, error } = useSWR((account || address) ?
        [`https://deep-index.moralis.io/api/v2/${address || account}/erc20?chain=${chainId || defaultChainId}`,
            moralisApiToken] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}
export { useFungibles };

