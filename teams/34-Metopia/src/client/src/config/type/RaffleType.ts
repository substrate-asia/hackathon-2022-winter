import { Moment } from "moment";

export declare type RaffleFilterType = "holder" | "discord" | "fifa"
export declare type RaffleFilterTraitsRequirementType = "include" | "range"

export declare type RaffleFilterTraitsRequirement = {
    type: RaffleFilterTraitsRequirementType,
    field: string,
    valueList: string[]
}

export declare type RaffleFilterExtraRequirements = {
    id: number,
    traits?: RaffleFilterTraitsRequirement[],
    balance?: number,
    period?: number
}

export declare type RaffleFilter = {
    id: number,
    type: RaffleFilterType,
    guildId: string;
    roles: string[];

    point?:number;
    address?: string;
    chainId?: string,
    extraRequirements?: RaffleFilterExtraRequirements[];
    snapshot?: string;
}

export declare type RaffleRewardType = "SBT" | "other"

export declare type RaffleReward = {
    type: RaffleRewardType;
    amount: number;
    supply: number;
    params: {
        title?: string;
        description?: string;
        featuredImageCID?: string;
        space?: string;
        fields?: [];
        cover?;
    }
}

export declare type Raffle = {
    /**
     * 1: public; 0: restricted; -1: unset;
     */
    public: number;
    owner: string;
    daoId: string;
    title: string;
    body: string;
    cover: string;
    chain: string;

    /**
     * timestamp
     */
    start: Moment;
    end: Moment;

    filters: RaffleFilter[];
    reward: RaffleReward[];
}
export declare type RaffleApiData = {
    id: number;
    /**
     * 1: public; 0: restricted; -1: unset;
     */
    // public: number;
    owner: string;
    daoId: string;
    title: string;
    body: string;
    cover: string;

    /**
     * timestamp
     */
    start: string;
    end: string;

    filters: RaffleFilter[];
    reward: RaffleReward[];
    total: 33;
    offset: 0;
    limit: 200;
    seed?: string,
    players: {
        id: number;
        owner: string;
        activityId: number;
        score: number;
        reward: string;
        method: string;
        createdAt: string;
        updatedAt: string;
    }[];
    canPlay: boolean;
}

const example = {
    public: 1,
    owner: "0xE5058B16b84afE3db3Cd0A87bC46cB7B7169246b",
    daoId: "metopia",
    title: 'Raffle title',
    description: 'Raffle description',
    cover: 'https://oss.metopia.xyz/raffle.png', // ipfs://hash
    start: '2022-10-09T14:22:49+08:00',
    end: '2022-10-09T14:22:49+08:00',

    filters: [{
        type: 'discord',
        guildId: "123456",
        roleIds: ["123456"]
    }, {
        type: 'holder',
        address: "0x13d71b9dfed77bedf977bfacf4f8247361712016",
        extraRequirements: [{
            type: 'trait',
            traits: [{
                field: 'background',
                valueList: ['pink']
            }]
        }, {
            type: 'balance',
            balance: 10,
            period: 3600 * 24 * 365
        }]
    }],

    reward: [
        {
            type: 'sbt',
            amount: 20,
            params: {
                title: "Data guardian",
                description: "Your Web3 identity unlocked! Congrats, Data Guardian!",
                featuredImageCID: 'QmX3LqU8dfqXo8NLmgwfgHUuKztPt4kMtRw2jSURcu8j7z',
                space: 'Metopia',
                fields: [],
            }
        }
    ]
}