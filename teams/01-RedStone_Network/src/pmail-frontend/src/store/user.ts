import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

interface UserState {
  name: string
  address: string
  mail: string
}

const initialState: UserState = {
  name: '',
  address: '',
  mail: ''
}
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
    setMail: (state, action: PayloadAction<string>) => {
      state.mail = action.payload
    }
  }
})

export const { setName, setAddress, setMail } = userSlice.actions

export const user = (state: RootState) => state.user.name

export default userSlice.reducer
