export interface Dao {
    id: string,
    settings: string,
    verified: number,
    createAt: number,
    updateAt?: number,
    proposalCount?: number,
    voterCount?: number,
    raffleCount?: number,
    activeProposalCount?: number,
    activeRaffleCount?: number
}

export interface BasicFormData {
    name: string,
    about: string,
    website: string,
    discord: string,
    twitter: string,
    opensea: string,
    avatar: string,
    banner: string,
    network: string,
    admins: string[]
}

export interface PersistentBasicFormData {
    name: string,
    about: string,
    website: string,
    discord: string,
    twitter: string,
    opensea: string,
    avatar: string,
    banner: string,
    network: string,
    admins: string[]
}

// export interface ValidationForm {
//     validation: {
//         name: "basic" | "discord",
//         params?: { guildId?: string, roles?: string[] }
//     },
//     filters: { onlyMembers: boolean, minScore: number },
//     members: string[]
// }

export interface ProposalSettingsForm {
    strategies: StrategyForm[],
    validation: AuthorValidation,
    filters: AuthorFilters,
    members: string[],
    delay: number,
    delayUnit: number,
    period: number,
    periodUnit: number,
    quorum: number
}

export interface AuthorValidation {
    name: "basic" | "discord",
    params?: { guildId?: string, roles?: string[] }
}
export interface AuthorFilters {
    onlyMembers: boolean, minScore: number
}
export interface VotingRules { delay: number, period: number, quorum: number }

export interface DaoSettings {
    about: string,
    admins: string[],
    avatar: string,
    banner: string,
    members: string[],
    name: string
    network: string
    strategies: Strategy[],
    validation: AuthorValidation,
    filters: AuthorFilters,
    voting: VotingRules,
    opensea: string,
    discord: string,
    twitter: string,
    website: string,
}

type Trait = {
    field: string,
    valueList: string[]
}

type TraitsBonus = {
    weight: number,
    traits: Trait[]
}
export type PERIOD_TYPES = "year" | "month" | "day" | 'minute' | 'second';

type HoldingBonus = {
    weight: number,
    unit: PERIOD_TYPES,
    value: number
}

export type StrategyType = 'balanceof-sub-nft'
export type StrategyNetworkType = `${number}`
export type BonusType = "holding" | "traits"

export type Bonus = {
    type: BonusType,
    weight: number,
    traits?: Trait[],
    unit?: PERIOD_TYPES,
    value?: number
}
// var json = {
//     params: {
//         space: "premint-space",
//         snapshot: "0",
//         strategies: [
//             {
//                 name: "balanceof-sub-nft",
//                 params: { collectionId: "e0b9bdcc456a36497a-KANBIRD" },
//             },
//         ],
//         addresses: ["HRodLzc5ke9qLjQL8mAD19efRyJcDgyB9GHQNkkjntaHLZi"],
//         network: "rmrk",
//     },
// };
export interface Strategy {
    name: StrategyType,
    network?: StrategyNetworkType,
    snapshot?: number,
    params: {
        collectionId: string,
    }
}

export interface StrategyForm {
    id?: number,
    name: StrategyType,
    collectionId: string,
}

export interface Account {
    "id": number,
    "owner": string,
    "username": string,
    "avatar": string,
    "introduction": string,
    "discordId": string,
    "discordName": string,
    "discordDiscrim": string,
    "discordAvatar": string,
    "twitterUserId": string,
    "twitterScreenName": string,
    "createdAt": string,
    "updatedAt": string,
    referral: string,
    referralCode: string,
}
