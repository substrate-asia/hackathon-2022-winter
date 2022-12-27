import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import useSWR from 'swr';
import { postFetcher } from '../../utils/restUtils';

let RSS3Class = null
let rss3 = null
const importRSS3 = async () => {
    if (!RSS3Class) {
        let { default: tmp } = await import('rss3')
        RSS3Class = tmp
    }
    return RSS3Class
}

const initRss3 = async (provider: Web3Provider) => {
    if (!rss3 && provider) {
        const RSS3 = await importRSS3()
        rss3 = new RSS3({
            endpoint: 'https://prenode.rss3.dev',
            address: provider.listAccounts[0],
            sign: provider.getSigner().signMessage,
        });
        return rss3
    }

}

const testAccountInfo = async () => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const RSS3 = await importRSS3()
    const rss3 = new RSS3({
        endpoint: 'https://prenode.rss3.dev',
        // https://hub.rss3.io
        address: await signer.getAddress(),
        sign: async (data) => await signer.signMessage(data),
    });

    // await rss3.items.custom.post({
    //     summary: 'Metopia account registration',
    //     link: {
    //         id: 'account',
    //         target: 'ipfs://xxx',
    //     },
    //     tags: ["metopia"]
    // });
    // await rss3.files.sync()
    const personaTimeline = await rss3.items.getList({
        persona: '0x5169A46Cf0B99C0c1e8d078D3B9F9B6ed9A215eA',
        limit: 100,
        fieldLike: 'Gitcoin'
    });
    // console.log(personaTimeline)
    const assets = (await rss3.assets.auto.getList('0x5169A46Cf0B99C0c1e8d078D3B9F9B6ed9A215eA'));
    // console.log(assets)
}


const getGitcoinData = async (persona) => {
    const RSS3 = await importRSS3()
    const rss3 = new RSS3({
        endpoint: 'https://prenode.rss3.dev'
    })
    const data = await rss3.items.getList({
        persona: persona,
        limit: 100,
        fieldLike: 'Gitcoin'
    });
    if (data.length > 0) {
        const assets = data.map((item) => item.target.field.replace(/^assets-/, ''));
        let details = await rss3.assets.getDetails({ assets: assets, full: true })
        return details
    }
    return data
}

const getPoapData = async (persona) => {
    const RSS3 = await importRSS3()
    const rss3 = new RSS3({
        endpoint: 'https://prenode.rss3.dev'
    })
    const data = await rss3.items.getList({
        persona: persona,
        limit: 100,
        fieldLike: 'POAP'
    });
    if (data.length > 0) {
        const assets = data.map((item) => item.target.field.replace(/^assets-/, ''));
        let details = await rss3.assets.getDetails({ assets: assets, full: true })
        details.forEach(d => {
            let general = data.find(da => d.id === da.target.field.replace(/^assets-/, ''))
            if (general)
                d.detail.date_created = general.date_created
        })
        return details
    }
    return data
}

// const useGitcoinData = (persona) => {
//     const { data, error } = useSWR([persona, 'gitcoin'], getGitcoinData,
//         {
//             refreshInterval: 0,
//             revalidateOnFocus: false
//         })
//     return { data, error }
// }



const useGitcoinData = (persona) => {
    const url = "https://pregod.rss3.dev/v1/notes"
    // const url = `https://pregod.rss3.dev/v1/notes/${persona}`
    const { data, error } = useSWR(persona ? [url, {
        "limit": 100,
        "address": [
            persona
        ],
        "query_status": true,
        "tag": [
            "donation"
        ]
    }] : null, postFetcher,
        {
            refreshInterval: 0,
            revalidateOnFocus: false
        })
    return { data, error }
}

const usePoapData = (persona) => {
    const url = "https://pregod.rss3.dev/v1/notes"
    // const url = `https://pregod.rss3.dev/v1/notes/${persona}`
    const { data, error } = useSWR(persona ? [url, {
        "limit": 100,
        "address": [
            persona
        ],
        "query_status": true,
        "type": ["poap"],
        "tag": [
            "collectible"
        ]
    }] : null, postFetcher,
        {
            refreshInterval: 0,
            revalidateOnFocus: false
        })
    return { data, error }
}

export { initRss3, testAccountInfo, getGitcoinData, useGitcoinData, getPoapData, usePoapData };

