import {useSelector } from 'react-redux'
import { RootState } from '../../../config/redux'
import './index.scss'
import './fire.scss'

const useClaimedModal = () => {
    const { isShow} = useSelector((state: RootState) => state.modalController.claimedModal)
    return {isShow}
}

export default useClaimedModal