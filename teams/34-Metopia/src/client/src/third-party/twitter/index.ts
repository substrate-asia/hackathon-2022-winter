import useSWR from "swr";
import { discordApi, twitterApi } from "../../config/urls";
import { defaultSWRConfig, getFetcher, ResponsePack } from '../../utils/restUtils';

const useTwitterData = (wallet: string, oauth_token?: string, oauth_verifier?: string) => {
    const { data, error } = useSWR(!wallet?.length ? null : [twitterApi.twitter_auth, {
        redirect_uri: process.env.REACT_APP_HOST + "beta/profile/edit",
        owner: wallet, oauth_token, oauth_verifier
    }], getFetcher, defaultSWRConfig)
    return { data, error }
}

export { useTwitterData }