const reducer = (state, action) => {
    switch (action.type) {
        //api
        case 'CONNECT_INIT':
            return { ...state, apiState: 'CONNECT_INIT' };

        case 'CONNECT':
            return { ...state, api: action.payload, apiState: 'CONNECTING' };

        case 'CONNECT_SUCCESS':
            return { ...state, apiState: 'READY' };

        case 'CONNECT_ERROR':
            return { ...state, apiState: 'ERROR', apiError: action.payload };

        case 'STEP':
            return { ...state, step: action.payload };

        case 'WALLET_NAME':
            return { ...state, name: action.payload };

        case 'SET_MNEMONIC':
            return { ...state, mnemonic: action.payload };

        case 'SET_MYINFO':
            return { ...state, info: action.payload };
        case 'SET_USERKEY':
            return { ...state, useKey: action.payload };

        case 'SET_RELOAD':
            return { ...state, reload: action.payload };

        case 'SET_WALLET':
            return { ...state, wallet: action.payload };

        //main contract
        case 'LOAD_MAINCONTRACT':
            return { ...state, maincontractState: 'LOAD_MAINCONTRACT' };

        case 'SET_MAINCONTRACT':
            return { ...state, maincontract: action.payload, maincontractState: 'READY' };

        case 'MAINCONTRACT_ERROR':
            return { ...state, maincontract: null, maincontractState: 'ERROR' };

        //accounts
        case 'LOAD_ALLACCOUNTS':
            return { ...state, allaccountsState: 'LOAD_ALLACCOUNTS' };

        case 'SET_ALLACCOUNTS':
            return { ...state, allAccounts: action.payload, allaccountsState: 'READY' };

        case 'ALLACCOUNTS_ERROR':
            return { ...state, allAccounts: null, allaccountsState: 'ERROR' };

        default:
            throw new Error(`Unknown type: ${action.type}`);
    }
};
export default reducer
