import useSWR from "swr";
import { discordApi } from "../../config/urls";
import { defaultSWRConfig, getFetcher, ResponsePack } from '../../utils/restUtils';

declare interface Guild {
    guildId: string,
    name: string,
    icon: string,
    permissions: string
}

declare interface Role {
    "guildId": string,
    "roleId": string,
    "name": string,
    // 0 for default
    "position": number,
}

const usePersonalDiscordData = (wallet: string, code?: string) => {
    const { data, error } = useSWR(wallet?.length ? [discordApi.personal_auth, {
        redirect_uri: process.env.REACT_APP_HOST + "beta/profile/edit",
        state: wallet, code: code
    }] : null, getFetcher, defaultSWRConfig)
    return { data, error }
}

const useGuildsData = (flag?): {
    data: Guild[], error: any
} => {
    const { data, error } = useSWR(flag != null && !flag ? null : [discordApi.guild_selectAll], getFetcher, defaultSWRConfig)
    return { data: data?.data?.guilds, error }
}

const useRolesData = (guildId: string): {
    data: Role[], error: any
} => {
    const { data, error } = useSWR(guildId?.length ? [discordApi.role_select, { guildId: guildId }] : null, getFetcher, defaultSWRConfig)
    return { data: data?.data?.roles, error }
}

export { usePersonalDiscordData, useGuildsData, useRolesData };
