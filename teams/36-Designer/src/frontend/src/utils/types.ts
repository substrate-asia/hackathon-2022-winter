import {Dispatch} from "react";

interface signObj{
    creator?:string
    saveAt?:number
    base64:string
    left:number
    page:number
    top:number
}

export type State = {
    loading: string | null
    iframeList: signObj[] | null
    pdf: any
}

export type Action = {
    type: ActionType
    payload?: any
}


export interface ContextType {
    state: State
    dispatch: Dispatch<Action>
}

export const enum ActionType {
    SET_LOADING = 'SET_LOADING',
    SET_IFRAME = 'SET_IFRAME',
    SET_PDF = 'SET_PDF',

}