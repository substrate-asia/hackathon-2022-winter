
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../config/redux'
import { displayLoadingModal, hideLoadingModal } from '../../../config/redux/modalControllerSlice'

const useLoadingModal = () => {
    const dispatch = useDispatch()

    const { isShow, tip } = useSelector((state: RootState) => state.modalController.loadingModal)

    const display = useCallback((tip?: string) => {
        dispatch(displayLoadingModal(tip))
    }, [dispatch])

    const hide = useCallback(() => {
        dispatch(hideLoadingModal())
    }, [dispatch])
    
    return { display, hide, isShow, tip }
}

export default useLoadingModal 
