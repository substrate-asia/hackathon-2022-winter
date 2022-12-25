import { ifSupportPolkadot } from '@/utils';
const defaultMetamaskWallet = localStorage.getItem('metamaskWallet');
const defaultPolkadotWallet = localStorage.getItem('polkadotWallet');
const defaultPolkadotWalletList = localStorage.getItem('polkadotWalletList');
const defaultCurrentChain = sessionStorage.getItem('currentChain');
export default {
    state() {
        return {
            metamaskWallet: defaultMetamaskWallet ? JSON.parse(defaultMetamaskWallet) : { meta: {} },
            polkadotWallet: defaultPolkadotWallet ? JSON.parse(defaultPolkadotWallet) : { meta: {} },
            polkadotWalletList: defaultPolkadotWalletList ? JSON.parse(defaultPolkadotWalletList) : [],
            supportChainList: [],
            currentChain: defaultCurrentChain ? JSON.parse(defaultCurrentChain) : {},
        }
    },
    getters: {
        ifLogin(state) {
            if (state.metamaskWallet.address || state.polkadotWallet.address) {
                return true;
            }
            return false;
        },
        currentChainWalletAddress(state) {
            if (ifSupportPolkadot(state.currentChain.network)) {
                return state.polkadotWallet.address
            } else {
                return state.metamaskWallet.address
            }
        }
    },
    mutations: {
        changeMetamaskWallet(state, value) {
            localStorage.setItem('metamaskWallet', JSON.stringify(value));
            state.metamaskWallet = value
        },
        changePolkadotWallet(state, value) {
            localStorage.setItem('polkadotWallet', JSON.stringify(value));
            state.polkadotWallet = value
        },
        changePolkadotWalletList(state, value) {
            localStorage.setItem('polkadotWalletList', JSON.stringify(value));
            state.polkadotWalletList = value
        },
        changeSupportChainList(state, value) {
            state.supportChainList = value
        },
        changeCurrentChain(state, value) {
            sessionStorage.setItem('currentChain', JSON.stringify(value));
            state.currentChain = value
        }
    },
    actions: {}
}