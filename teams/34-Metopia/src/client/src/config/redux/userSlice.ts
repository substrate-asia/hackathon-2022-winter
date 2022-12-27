import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'wallet',
    initialState: {
        address: null,
        meta: null,
        type: null
    },
    reducers: {
        setWallet: (state, action) => {
            state.address = action.payload.address
            state.meta = action.payload.meta
            state.type = action.payload.type
        }
    },
})

export const { setWallet } = userSlice.actions
export default userSlice.reducer