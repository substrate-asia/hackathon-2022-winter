import type {State,Action} from '../utils/types'
import { ActionType } from "../utils/types";

const reducer = (state:State, action:Action) => {
    switch (action.type) {

        case ActionType.SET_LOADING:
            return { ...state, loading: action.payload };

        case ActionType.SET_PDF:
            return { ...state, pdf: action.payload };

        case ActionType.SET_IFRAME:
            return { ...state, iframeList: action.payload };


        default:
            throw new Error(`Unknown type: ${action.type}`);
    }
};
export default reducer
