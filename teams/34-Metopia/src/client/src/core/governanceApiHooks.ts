import useSWR from "swr";
import {
    loadSnapshotProposalsByDao as loadSnapshotProposalsBySpace, loadSnapshotProposalsById, loadSnapshotVotesByProposal,
    loadSnapshotVotesByProposalAndSelf
} from "../config/graphql";
import { snapshotApi } from '../config/urls';
import { defaultSWRConfig, getFetcher, postFetcher } from "../utils/restUtils";
import { Dao } from './dao/type';
import { encodeAddress } from '@polkadot/util-crypto';

export const useDaoListData = (): { data: Dao[], error: any } => {
    const { data, error } = useSWR([snapshotApi.dao_select], getFetcher, defaultSWRConfig)
    return { data: data?.code === 200 ? data?.content : null, error: error || (data?.code !== 200 && data?.content) }
}

export const useDaoById = (id: string): { data: Dao, error: any } => {
    const { data, error } = useSWR(id ? [snapshotApi.space_selectById, { id: id }] : null, getFetcher, defaultSWRConfig)
    return { data: data?.code === 200 ? data?.content : null, error: error || (data?.code !== 200 && data?.content) }
}

export const useDaoByIds = (ids: string[]): { data: Dao[], error: any } => {
    const { data, error } = useSWR(ids?.length ? [snapshotApi.space_selectByIds, ids] : null, postFetcher, defaultSWRConfig)
    return { data: data?.code === 200 ? data?.content : null, error: error || (data?.code !== 200 && data?.content) }
}


export const useScoreData = (space: string, snapshot: any, strategies: any[], addresses: string[]): { data: object, error: any } => {
    if (typeof snapshot == 'number') {
        snapshot = parseFloat(snapshot + '')
    }

    // let scoreParam = { "params": { space: space, snapshot: snapshot || 'latest', strategies, addresses, network: 1 } }
    
    if (addresses?.length) {
        addresses = addresses?.map(addr => encodeAddress(addr, 2))
    }
    let scoreParam = {
        "params": {
            space: space, snapshot: snapshot || 'latest',
            strategies, addresses, network: "rmrk"
        }
    }
    const { data, error } = useSWR(space && addresses?.length && strategies ? [snapshotApi.score, scoreParam] : null, postFetcher, defaultSWRConfig)
    return {
        data: data?.result?.scores,
        error
    }
}


export const useProposalScoreData = (proposalId: string) => {
    const { data, error, mutate } = useSWR(proposalId ? [snapshotApi.proposal_scores(proposalId)] : null, getFetcher, defaultSWRConfig)
    return {
        data: data?.scores,
        error,
        mutate: () =>
            mutate(getFetcher(proposalId))
    }
}

export const useProposalDataBySpace = (slug, first?, skip?): { data: any[], error: any } => {
    const { data, error } = useSWR([snapshotApi.graphql, loadSnapshotProposalsBySpace(slug, first, skip)], postFetcher, defaultSWRConfig)
    return { data: data?.data?.proposals, error }
}

export const useHistoryCountData = (spaceId: string, addresses: string[]): { data: { proposal: any[], vote: any[] }, error: any } => {
    const { data, error } = useSWR(addresses?.length ? [snapshotApi.history_selectCountByUserList, {
        spaceId,
        addresses
    }] : null, postFetcher, defaultSWRConfig)
    return { data: data?.content, error }
}

export const useProposalById = (id) => {
    const { data, error } = useSWR(id && [snapshotApi.graphql, loadSnapshotProposalsById(id)], postFetcher, defaultSWRConfig)
    return { data: data?.data?.proposal, error }
}

export const useLatestProposalData = (): { data: any[], error: any } => {
    const { data, error } = useSWR([snapshotApi.proposal_selectLatest], getFetcher, defaultSWRConfig)
    return { data: data?.code === 200 ? data?.content : null, error: error || (data?.code !== 200 && data?.content) }
}

/**
 * @param choice start at 1
 */
export const useVotesData = (proposalId: string, owner?: string) => {
    const { data, error } = useSWR(proposalId ?
        [snapshotApi.graphql,
        owner?.length ?
            loadSnapshotVotesByProposalAndSelf(proposalId, owner) :
            loadSnapshotVotesByProposal(proposalId)] : null,
        postFetcher, defaultSWRConfig)
    // const { data, error } = useSWR(proposalId ?
    //     [snapshotApi.graphql, owner ?
    //         // loadSnapshotVotesByProposal(proposalId)
    //         loadSnapshotVotesByProposalAndSelf(proposalId, owner)
    //         : loadSnapshotVotesByProposal(proposalId)] : null,
    //     postFetcher, defaultSWRConfig)
    return { data: data?.data?.votes, self: data?.data?.self }

}