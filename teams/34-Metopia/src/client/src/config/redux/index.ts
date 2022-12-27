import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { connectSubstrate } from '../../wallet/SubstrateWallet'
import { formSlice } from './formSlice'
import { modalController } from './modalControllerSlice'
import userReducer, { setWallet } from './userSlice'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useLoadingModal } from '../../component/modals/LoadingModal'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { encodeAddress } from '@polkadot/util-crypto';
const store = configureStore({
    reducer: {
        user: userReducer,
        modalController: modalController.reducer,
        form: formSlice.reducer
    },
})

export const useWallet = (): [
    wallet: Wallet,
    connect: { (): any },
    disconnect: { (): any }
] => {
    const wallet = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()
    const { display: loading, hide: unloading } = useLoadingModal()
    const connect = async () => {
        try {
            loading("Connecting with Polkadot.js")
            let wallet = await connectSubstrate()

            if (!wallet?.address == null) {
                dispatch(setWallet(null))
            } else {
                dispatch(setWallet(wallet))
            }
            unloading()
            return wallet?.address
        } catch (e) {
            console.log(e)
            unloading()
        }
    }

    const disconnect = async () => {
        dispatch(setWallet({}))
    }

    return [wallet, connect, disconnect]
}

declare type Wallet = {
    "address": string,
    "meta": {
        "genesisHash": string,
        "name": string,
        "source": string
    },
    "type": string
}

declare type RootState = {
    user: Wallet,
    modalController: {
        loginModal: { isShow: boolean, stepRequired: number },
        userProfileEditorModal: { isShow: boolean, user: any },
        loadingModal: { isShow: boolean, tip?: string },
        alertModal: { isShow: boolean, title: string, body: string, warning: boolean },
        profileCompleteModal: { isShow: boolean, state?: number },
        congratsModal: { isShow: boolean, introduction: string, image: string },
        confirmModal: { isShow: boolean, title: string, body: string },
        claimedModal: { isShow: boolean },
        badgeSynchronizeModal: { isShow: boolean },
        joinLuckyDrawModal: { isShow: boolean, amount: number },
        joinLatestLuckyDrawModal: { isShow: boolean, raffleId: number, requirement: number }
    },
    form: any
}

export { type RootState }
export type AppDispatch = typeof store.dispatch
export default store