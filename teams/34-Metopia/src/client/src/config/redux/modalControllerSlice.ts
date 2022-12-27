import { createSlice } from '@reduxjs/toolkit'

export const modalController = createSlice({
    name: 'modalController',
    initialState: {
        loginModal: {
            isShow: false,
            stepRequired: 2
        },
        userProfileEditorModal: {
            isShow: false,
            user: null
        },
        loadingModal: {
            isShow: false,
            tip: null
        }, profileCompleteModal: {
            isShow: false,
            state: 0
        }, alertModal: {
            isShow: false,
            title: null,
            body: null,
            warning: true
        }, congratsModal: {
            isShow: false,
            introduction: null,
            image: null,
        }, claimedModal: {
            isShow: false
        }, confirmModal: {
            isShow: false,
            title: null,
            body: null,
        },
    },
    reducers: {
        hideLoginModal: (state) => {
            state.loginModal.isShow = false
        },
        displayLoginModal: (state, action) => {
            state.loginModal.isShow = true
            state.loginModal.stepRequired = action.payload
        },
        hideAlertModal: (state) => {
            state.alertModal.isShow = false
        },
        displayAlertModal: (state, action) => {
            state.alertModal.isShow = true
            state.alertModal.title = action.payload.title
            state.alertModal.body = action.payload.body
            state.alertModal.warning = action.payload.warning == null ? true : false
        },
        hideUserProfileEditorModal: (state) => {
            state.userProfileEditorModal.isShow = false
        },
        displayUserProfileEditorModal: (state, action) => {
            state.userProfileEditorModal.isShow = true
            state.userProfileEditorModal.user = action.payload
        },
        hideLoadingModal: (state) => {
            state.loadingModal.isShow = false
        },
        displayLoadingModal: (state, action) => {
            state.loadingModal.isShow = true
            state.loadingModal.tip = action.payload
        },
        hideProfileCompleteModal: (state) => {
            state.profileCompleteModal.isShow = false
        },
        displayProfileCompleteModal: (state, action) => {
            state.profileCompleteModal.isShow = true
            state.profileCompleteModal.state = action.payload
        },
        hideCongratsModal: (state) => {
            state.congratsModal.isShow = false
        },
        displayCongratsModal: (state, action) => {
            state.congratsModal.isShow = true
            state.congratsModal.introduction = action.payload.introduction
            state.congratsModal.image = action.payload.image
        },
        displayConfirmModal: (state, action) => { 
            state.confirmModal.isShow = true
            state.confirmModal.title = action.payload.title
            state.confirmModal.body = action.payload.body
        },
        hideConfirmModal: (state) => {
            state.confirmModal.isShow = false
        },
    },
})

export const { hideLoginModal, displayLoginModal,
    hideUserProfileEditorModal, displayUserProfileEditorModal,
    hideLoadingModal, displayLoadingModal,
    hideProfileCompleteModal, displayProfileCompleteModal,
    displayAlertModal, hideAlertModal,
    hideCongratsModal, displayCongratsModal,
    hideConfirmModal, displayConfirmModal,
} = modalController.actions