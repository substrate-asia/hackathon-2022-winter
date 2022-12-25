import { createRouter, createWebHashHistory } from 'vue-router'
import { supports } from "@/api/staking";
import store from '@/store'
import { ParaChainStyle } from '@/utils/chain/parachainStyle';
const routes = [{
    path: '/',
    name: 'Layout',
    redirect: 'home',
    component: () =>
        import('@/views/Layout'),
    beforeEnter: async (to, from, next) => {
        const supportChainList = await supports();
        const arr = [...supportChainList,
        // {
        //     decimals: [10],
        //     displayName: 'Turing Network',
        //     network: 'turing',
        //     prefix: 51,
        //     standardAccount: '*25519',
        //     symbols: ['TUR'],
        //     website: 'https://oak.tech/',
        //     // wssEndpoints: ['wss://rpc.turing-staging.oak.tech'],
        //     wssEndpoints: ['wss://rpc.turing.oak.tech'],
        // },
            //     {
            //     decimals: [18],
            //     displayName: 'Moonriver',
            //     network: 'moonriver',
            //     prefix: 1285,
            //     standardAccount: 'secp256k1',
            //     symbols: ['MOVR'],
            //     website: 'https://moonbeam.network',
            //     wssEndpoints: ['wss://rpc.pinknode.io/moonriver/explorer'],
            // }
        ].map((v) => {
            const find = ParaChainStyle.find((sv) => sv.network == v.network);
            if (find) {
                return {
                    ...v,
                    ...find,
                };
            } else {
                return v;
            }
        });

        store.commit("changeSupportChainList", arr);
        next();
    },
    children: [{
        path: 'home',
        name: 'home',
        meta: {
            title: 'Web3Go Staking'
        },
        component: () =>
            import('@/views/home')
    }, {
        path: 'leaderBoard',
        name: 'leaderBoard',
        meta: {
            title: 'Leaderboard'
        },
        component: () =>
            import('@/views/leaderBoard')
    }, {
        path: 'myStake',
        name: 'myStake',
        meta: {
            title: 'My Stake'
        },
        component: () =>
            import('@/views/myStake')
    }, {
        path: 'collatorDetail',
        name: 'collatorDetail',
        meta: {
            title: 'Collator Detail'
        },
        component: () =>
            import('@/views/collatorDetail')
    }, {
        path: 'delegatorDetail',
        name: 'delegatorDetail',
        meta: {
            title: 'Delegator Detail'
        },
        component: () =>
            import('@/views/delegatorDetail')
    }],
},
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})
export default router