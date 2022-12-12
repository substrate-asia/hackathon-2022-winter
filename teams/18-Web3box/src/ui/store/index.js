import { createStore } from "redux";
import { SET_SEED, SET_ACCOUNT, SET_ADDRESS, SET_USERIMG, SET_ETHADDRESS } from './action'
import { persistStore, persistReducer } from 'redux-persist';
//  sessionStorage
import storageSession from 'redux-persist/lib/storage';
// import storage from 'redux-persist/lib/storage'; //localStorage
//import { AsyncStorage } from 'react-native'; //react-native
const storageConfig = {
    key: 'root',
    storage: storageSession, //
    blacklist: [], // reducer
};
const defaultState = {
    keys: 0
}
function user(state = defaultState, action) {
    switch (action.type) {
        case SET_ACCOUNT:
            return {
                ...state,
                account: action.account,
            }
        case SET_SEED:
            return {
                ...state,
                keys: action.seed,
                seed: action.seed
            }
        case SET_ADDRESS:
            return {
                ...state,
                address: action.address
            }
        case SET_USERIMG:
            return {
                ...state,
                url: action.url
            }
        case SET_ETHADDRESS:
            return {
                ...state,
                ethAddress: action.ethAddress
            }

        default:
            return state;
    }
}


const myPersistReducer = persistReducer(storageConfig, user);
const store = createStore(myPersistReducer);
export const persistor = persistStore(store);
export default store;