import { suitablePeriodUnit, unitNumToText, unitTextToNum } from '../../component/form'
import { toFixedIfNecessary } from '../../utils/numberUtils'
import { unique } from '../../utils/stringUtils'
import { AuthorFilters, AuthorValidation, BasicFormData, Bonus, PERIOD_TYPES, PersistentBasicFormData, ProposalSettingsForm, Strategy, StrategyForm, StrategyNetworkType, StrategyType, VotingRules } from './type'

export const basicFormToPersistent = (data: BasicFormData): PersistentBasicFormData => {
    let res = {
        ...data,
        about: data.about,
        admins: unique(data.admins.filter(admin => admin?.length && admin.indexOf('0x') === 0)),
    }
    return res
}

export const persistantToStrategiesForm = (data: Strategy[]): StrategyForm[] => {
    return data.map(d => {
        let defaultWeight = 1
        return {
            name: d.name,
            collectionId: d.params.collectionId
        }
    })
}

const strategiesFormToPersistant = (strategies: StrategyForm[]): Strategy[] => {
    return strategies.map(c => {
        return {
            name: c.name,
            params: {
                collectionId: c.collectionId
            }
        }
    })
}

export const proposalFormToPersistent = (data: ProposalSettingsForm): {
    filters: AuthorFilters,
    validation: AuthorValidation,
    voting: VotingRules,
    strategies: Strategy[],
    members: string[]
} => {
    if (data.filters.minScore < 0)
        data.filters.minScore = 0
    let chainId: StrategyNetworkType = "1"
    let strategies: Strategy[] = strategiesFormToPersistant(data.strategies)
    let res = {
        filters: data.filters,
        validation: data.validation,
        voting: { delay: data.delay, period: data.period, quorum: data.quorum },
        strategies: strategies,
        members: data.members
    }
    return res
}

export const persistentToProposalForm = (data: {
    filters: AuthorFilters,
    validation: AuthorValidation,
    voting: VotingRules,
    strategies: Strategy[],
    members: string[]
}): ProposalSettingsForm => {
    if (data.filters?.minScore < 0)
        data.filters.minScore = 0
    let res = {
        voting: data.voting,
        strategies: persistantToStrategiesForm(data.strategies?.filter(s => s.name !== ('delegation' as StrategyType)) || []),
        validation: data.validation || {
            name: "basic",
            params: {}
        },
        filters: data.filters || { onlyMembers: false, minScore: -1 },
        members: data.members || [],
        delay: data.voting?.delay || 0,
        delayUnit: unitTextToNum(suitablePeriodUnit(data.voting?.delay || 3600 * 24)),
        period: data.voting?.period || 0,
        periodUnit: unitTextToNum(suitablePeriodUnit(data.voting?.period || 3600 * 24)),
        quorum: data.voting?.quorum || 0
    }
    return res
}


/**
 * Import data from Snapshot.org database
 */
export const snapshotDataToForm = (data) => {
    let basicFormData = {
        name: data.name,
        about: data.about,
        website: data.domain,
        discord: data.discord,
        twitter: data.twitter ?
            (data.twitter.indexOf("https://twitter.com") === 0 ? data.twitter : `https://twitter.com/${data.twitter}`) :
            '',
        opensea: '',
        avatar: data.avatar,
        banner: '',
        admins: data.admins
    }

    let votingForm = Object.assign({}, data.voting, { quorum: 0 })
    let d = data.strategies?.filter(s => s.name === 'erc721' && s.network === '1')
    let consensusForm = {
        admins: data.admins,
        membership: d?.length ? d.map((s, i) => {
            return {
                id: i + 1,
                editing: false,
                name: s.params.symbol,
                tokenAddress: s.params.address,
                defaultWeight: 1,
                bonus: []
            }
        }) : []
    }
    let proposalForm = {
        mode: (data.filters?.onlyMembers ? 1 : 0),
        filters: data.filters,
        validation: data.validation,
        members: data.members
    }

    return { basicFormData, consensusForm, votingForm, proposalForm, network: data.network }
}
