import { encodeQueryData } from "../utils/restUtils"

const ossPrefix = process.env.REACT_APP_CDN_PREFIX
export const documentLink = "https://docs.metopia.xyz/metopia/world-cup-campaign/metopia-world-cup-2022-voting-campaign-rule"
// export const ossImageThumbnailPrefix = (width, height) => `?x-oss-process=image/resize,w_${width},h_${height},m_fill`
export const thumbnail = (src, width, height) => {
    if (src.indexOf('svg') > 0) {
        return src
    }
    return encodeQueryData(src, {
        'x-oss-process': `image/resize,w_${width},h_${height},m_fill`,
        width
    })
}

export const removeThumbnail = (src) => {
    let index = src.indexOf('x-oss-process')

    if (index > 0) {
        return src.substring(0, index - 1)
    }
    return src
    // return encodeQueryData(src, {
    //     'x-oss-process': `image/resize,w_${width},h_${height},m_fill`,
    //     width
    // })
}

const dataCenterRoot = process.env.REACT_APP_DATA_CENTER_API_PREFIX
const snapshotScoreApiRoot = process.env.REACT_APP_SNAPSHOT_SCORE_API_PREFIX
const snapshotCoreRoot = process.env.REACT_APP_SNAPSHOT_CORE_API_PREFIX
const metopiaServiceRoot = process.env.REACT_APP_METOPIA_SERVICE_API_PREFIX
const metopiaHost = process.env.REACT_APP_HOST
const metopiaApiRoot = process.env.REACT_API_ROOT

const userApi = {
    user_create: dataCenterRoot + "owners",
    user_update: dataCenterRoot + "owners/",
    user_selectByOwner: dataCenterRoot + "owners/",
    user_selectByOwners: dataCenterRoot + "owners",
    delegate_select: dataCenterRoot + "users",

    delegate_event_select: dataCenterRoot + "delegates/events",

    delegate_insert: dataCenterRoot + "users",

    user_history: metopiaServiceRoot + "history/select",
    user_historyDistinctSpace: metopiaServiceRoot + "history/selectDistinctSpace",

    user_cacheActiveList: dataCenterRoot + "users/compute",
    user_activeList: dataCenterRoot + "users/list"
}

const draftApi = {
    create_draft: dataCenterRoot + "drafts",
    update_draft: dataCenterRoot + "drafts",
    get_drafts: dataCenterRoot + "drafts",
    delete_draft: dataCenterRoot + "drafts"
}

const discordApi = {
    guild_selectAll: dataCenterRoot + 'discord/bot/guilds',
    role_select: dataCenterRoot + 'discord/guilds/roles',
    personal_auth: dataCenterRoot + "discord/auth",
    unbound: dataCenterRoot + 'discord/unbound'
}

const twitterApi = {
    twitter_auth: dataCenterRoot + 'twitter/auth',
    unbound: dataCenterRoot + 'twitter/unbound'
}

const nftDataApi = {
    nft_image: dataCenterRoot + "nfts/image",
    nft_cache: dataCenterRoot + "nfts/cache",
    nft_cacheAll: dataCenterRoot + "nfts/cache-all",
    nft_transfer_cacheAll: dataCenterRoot + "nfts/transfers/cache-all",
    nft_attributes: dataCenterRoot + "nfts/attributes",
    goverance_selectByOwner: dataCenterRoot + "owners/governance-records",
    nft_fetch: dataCenterRoot + 'nfts/transfers/received-count',
}

const alphaTestEventApi = {
    alphaEvent1: metopiaServiceRoot + "account/selectAlphaRequest1",
    alphaEvent2: metopiaServiceRoot + "account/selectAlphaRequest2",
    sign: "https://ai.metopia.xyz/" + "signer/sig",
    alphaEvent3_whitelist: "https://ai.metopia.xyz/" + "signer/whitelist",
    // sign: metopiaApiRoot + "signer/sig"
}

export const fifaApi = {
    verifyTweetAndSign: dataCenterRoot + "twitter/verify-and-sign",
    checkin: dataCenterRoot + "sbts/tokens/update",
    getRealTimeMetadata: dataCenterRoot + "sbts/tokens/update-logs/sig",
    queryLog: dataCenterRoot + "sbts/tokens/update-logs",
    fifaResult: metopiaServiceRoot + "fifa/selectResult",
    updateLog: dataCenterRoot + "sbts/tokens/update",
    fifaLuckyDrawSig: dataCenterRoot + "sbts/tokens/sig-high-pointer"
}

const snapshotApi = {
    dao_create: metopiaServiceRoot + "club/create/kusama",
    dao_update: metopiaServiceRoot + "club/update/kusama",
    dao_select: metopiaServiceRoot + "club/select",
    space_selectById: metopiaServiceRoot + "club/selectById",
    space_selectByIds: metopiaServiceRoot + "club/selectByIds",
    proposal_selectLatest: metopiaServiceRoot + "proposal/selectLatest",
    proposal_scores: proposalId => `https://ai.metopia.xyz/kusama/api/scores/${proposalId}`,
    uploadImage: metopiaServiceRoot + "uploadImage",
    uploadImageAvatar: metopiaServiceRoot + "uploadImage/avatar",
    score: snapshotScoreApiRoot + "subscores",
    graphql: snapshotCoreRoot + "graphql",
    msg: snapshotCoreRoot + "api/msg",
    loadSpaces: snapshotCoreRoot + "api/loadspaces",
    history_selectCountByUserList: metopiaServiceRoot + "history/selectCountByUserList",
}

export const raffleApi = {
    select: dataCenterRoot + "activities",
    selectById: id => (dataCenterRoot + "activities/" + id),
    create: dataCenterRoot + "activities",
    join: id => dataCenterRoot + "activities/" + id + "/play",
    draw: id => dataCenterRoot + "activities/" + id + "/lotto",
    selectSbts: dataCenterRoot + "sbts",
    winnerSign: id => dataCenterRoot + `activities/${id}/player/sign`,
}

const thirdpartyApi = {
    snapshot_api_graphql: "https://hub.snapshot.org/graphql",
}

const localRouter = (name?: string | null, param?: any) => {
    if (name === 'test') return '/beta/test'
    if (name === 'alphaEvent') return `/beta/event/${param.index}`
    if (name === 'profile') return param?.slug ? `/beta/profile/${param.slug}` : '/beta/profile/'
    if (name === 'profile.edit') return `/beta/profile/edit`
    if (name === 'ai') return '/ai'
    if (name === 'home') return '/beta'
    if (name === 'dao') return `/beta/dao/${param.dao}${param.subpage != null ? '?subpage=' + param.subpage : ''}`
    if (name === 'dao.prefix') return '/beta/dao/'
    if (name === 'dao.create') return '/beta/dao/create'
    if (name === 'dao.raffle') return `/beta/dao/${param.dao}?subpage=1`
    if (name === 'dao.settings.proposal') return `/beta/dao/settings/proposal/${param.dao}`
    if (name === 'dao.settings.basic') return `/beta/dao/settings/basic/${param.dao}`
    if (name === 'dao.settings.rulesDetails') return `/beta/dao/${param.dao}/rules`
    if (name === 'proposal.prefix') return '/beta/proposal/'
    if (name === 'proposal.fifa') return '/beta/fifa/'
    if (name === 'proposal.create') return '/beta/dao/' + param.dao + "/propose"
    if (name === 'raffle.create') return '/beta/dao/' + param.dao + "/createRaffle"
    if (name === 'raffle') return '/beta/dao/' + param.dao + "/raffle/" + param.raffle
    if (name === 'fifa') return '/beta/fifa'
    if (name == 'badge.create') return '/beta/'
    return "/"
}
const pinataApiPrefix = "https://api.pinata.cloud/"

const ipfsApi = {
    pinata_pinFileToIPFS: pinataApiPrefix + "pinning/pinFileToIPFS"
}

const testApi = {
    image_store: metopiaServiceRoot + "uploadImage",
    membership_mint: metopiaServiceRoot + "test/membership/mint",
    membership_select: metopiaServiceRoot + "test/membership/select/",
    subscription_create: metopiaServiceRoot + "subscription/create",
    feedback_create: metopiaServiceRoot + "feedback/create"
}

const ceramicNode = process.env.REACT_APP_CERAMIC_API


export { alphaTestEventApi, ossPrefix as cdnPrefix, localRouter, draftApi, nftDataApi, snapshotApi, ipfsApi, ceramicNode, thirdpartyApi, testApi, discordApi, userApi, twitterApi }