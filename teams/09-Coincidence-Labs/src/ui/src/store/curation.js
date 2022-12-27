
import Cookie from 'vue-cookies'

export default {
    namespaced: true,
    state: {
        draft: localStorage.getItem('curation-draft'),
        ongoingList: [],
        endList: [],
        closeList: [],
        detailCuration: {},
        detailRecords: [],
        // cache the created curation which not push to backend
        pendingTweetCuration: localStorage.getItem('pending-cache-curation'),
        pendingTip: localStorage.getItem('pending-cache-tip'),
        pendingPopup: localStorage.getItem('pending-cache-popup'),
        customTokens: localStorage.getItem('custom-tokens')
    },
    mutations: {
        saveDraft: (state, draft) => {
            if (draft && Object.keys(draft).length > 0) {
                state.draft = JSON.stringify(draft);
                // const draftStr = JSON.stringify(draft)
                localStorage.setItem('curation-draft', state.draft)
            }else {
                state.draft = null;
                localStorage.removeItem('curation-draft');
            }
        },
        saveOngoingList: (state, ongoingList) => {
            state.ongoingList = ongoingList
        },
        saveEndList: (state, endList) => {
            state.endList = endList
        },
        saveCloseList: (state, closeList) => {
            state.closeList = closeList
        },
        saveDetailCuration: (state, detailCuration) => {
            state.detailCuration = detailCuration
        },
        saveDetailRecords: (state, detailRecords) => {
            state.detailRecords = detailRecords
        },
        savePendingTweetCuration: (state, pendingTweetCuration) => {
            if (pendingTweetCuration && Object.keys(pendingTweetCuration).length > 0) {
                state.pendingTweetCuration = JSON.stringify(pendingTweetCuration)
                localStorage.setItem('pending-cache-curation', state.pendingTweetCuration)
            }else {
                state.pendingTweetCuration = null;
                localStorage.removeItem('pending-cache-curation')
            }
        },
        savePendingTip: (state, pendingTip) => {
            if (pendingTip && Object.keys(pendingTip).length > 0) {
                state.pendingTip = JSON.stringify(pendingTip)
                localStorage.setItem('pending-cache-tip', state.pendingTip)
            }else {
                state.pendingTip = null;
                localStorage.removeItem('pending-cache-tip')
            }
        },
        savePendingPopup: (state, pendingPopup) => {
            if (pendingPopup && Object.keys(pendingPopup).length > 0) {
                state.pendingPopup = JSON.stringify(pendingPopup)
                localStorage.setItem('pending-cache-popup', state.pendingPopup)
            }else {
                state.pendingPopup = null;
                localStorage.removeItem('pending-cache-popup')
            }
        },
        saveCustomTokens: (state, customTokens) => {
            if (customTokens && Object.keys(customTokens).length > 0) {
                state.customTokens = JSON.stringify(customTokens);
                localStorage.setItem('custom-tokens', state.customTokens)
            }else {
                state.customTokens = null;
                localStorage.removeItem('custom-tokens')
            }
        }
    },
    getters: {
        getDraft: (state) => {
            let draft = state.draft;
            if (draft) {
                if (typeof(draft) === 'string') {
                    return JSON.parse(draft)
                }
                return draft;
            }else {
                draft = localStorage.getItem('curation-draft')
                if (draft)
                return JSON.parse(draft)
                return null
            }
        },
        getPendingTweetCuration: (state) => {
            let pendingTweetCuration = state.pendingTweetCuration;
            if (pendingTweetCuration) {
                if (typeof(pendingTweetCuration) === 'string') {
                    return JSON.parse(pendingTweetCuration)
                }
                return pendingTweetCuration;
            }else {
                pendingTweetCuration = localStorage.getItem('pending-cache-curation')
                if (pendingTweetCuration)
                return JSON.parse(pendingTweetCuration)
                return null
            }
        },
        getPendingTip: (state) => {
            let pendingTip = state.pendingTip;
            if (pendingTip) {
                if (typeof(pendingTip) === 'string') {
                    return JSON.parse(pendingTip)
                }
                return pendingTip;
            }else {
                pendingTip = localStorage.getItem('pending-cache-tip')
                if (pendingTip)
                    return JSON.parse(pendingTip)
                return null
            }
        },
        getPendingPopup: (state) => {
            let pendingPopup = state.pendingPopup;
            if (pendingPopup) {
                if (typeof(pendingPopup) === 'string') {
                    return JSON.parse(pendingPopup)
                }
                return pendingPopup;
            }else {
                pendingPopup = localStorage.getItem('pending-cache-popup')
                if (pendingPopup)
                return JSON.parse(pendingPopup)
                return null
            }
        },
        getCustomTokens: (state) => {
            let customTokens = state.customTokens;
            if (customTokens) {
                if (typeof(customTokens) === 'string') {
                    return JSON.parse(customTokens)
                }
                return customTokens;
            }else {
                customTokens = localStorage.getItem('custom-tokens')
                if (customTokens) {
                    return JSON.parse(customTokens)
                }
                return null
            }
        }
    }
}