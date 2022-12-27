
import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../config/redux'
import { displayAlertModal, hideAlertModal } from '../../../config/redux/modalControllerSlice'
import { toast as toast1 } from 'react-toastify'

const useAlertModal = () => {
    const dispatch = useDispatch()

    const { isShow, title, body, warning } = useSelector((state: RootState) => state.modalController.alertModal)

    const display = useCallback((title?: string, body?: string, warning?: boolean) => {
        dispatch(displayAlertModal({ title: title || 'Alert', body, warning }))
    }, [dispatch])
    const hide = useCallback(() => {
        dispatch(hideAlertModal())
    }, [dispatch])
    return { display, hide, isShow, title, body, warning }
}

export default useAlertModal

export const toast = (title) => toast1.success(title, {
    className: "r-toast",
    bodyClassName: "r-toast-body",
    icon: <img src="https://oss.metopia.xyz/imgs/checked.svg" alt="√" />
})