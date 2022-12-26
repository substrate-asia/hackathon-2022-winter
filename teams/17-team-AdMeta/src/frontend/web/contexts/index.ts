
import { createContext } from 'react'

interface BaseData {
  address?: string,
  setAddress?: (v: string) => void,
  step?: number,
  setStep?: (v: number) => void,
}

const initialState: BaseData = {
  address: '',
  step: 1,
}


const BaseCtx = createContext(initialState);

export default BaseCtx;
