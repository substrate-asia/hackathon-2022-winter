
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../config/redux'
import { displayProfileCompleteModal, hideProfileCompleteModal } from '../../../config/redux/modalControllerSlice'

const useProfileCompleteModal = () => {
    const dispatch = useDispatch()

    const { isShow, state } = useSelector((state: RootState) => state.modalController.profileCompleteModal)

    const display = (state?: number) => {
        dispatch(displayProfileCompleteModal(state))
    }
    const hide = () => {
        dispatch(hideProfileCompleteModal())
    }
    return { display, hide, isShow, state }
}

export default useProfileCompleteModal 
