import { createSlice } from '@reduxjs/toolkit'

export const formSlice = createSlice({
    name: 'form',
    initialState: {
        form: {}
    },
    reducers: {
        update: (state, action) => {
            let key = action.payload.key
            let val = action.payload.value
            state.form[key] = Object.assign({}, state.form[key], val)
        }
    },
})


export const { update } = formSlice.actions