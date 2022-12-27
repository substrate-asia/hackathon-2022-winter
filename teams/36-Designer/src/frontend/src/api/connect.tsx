import {createContext, Dispatch, ReactElement, useContext, useReducer,useEffect} from 'react';
import reducer from './reducer';
import INIT_STATE from './initState';
import {Action, ActionType, ContextType, State} from "../utils/types";

const initState = {...INIT_STATE};
const Web3Context = createContext<ContextType>({} as any);

interface Props{
    children: ReactElement
}

const SubContextProvider = (props:Props) => {
    const [state, dispatch] = useReducer(reducer, initState);
    console.log("=====state=====",state);

    useEffect(()=>{
    },[])

    return <Web3Context.Provider value={{state,dispatch}}>
        {props.children}
    </Web3Context.Provider>;
};

const useSubstrate = () => ({...useContext(Web3Context)});
export {SubContextProvider, useSubstrate};
