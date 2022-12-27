import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userReducer from './user'
import storage from 'redux-persist/lib/storage'
import { persistReducer } from 'redux-persist'
import thunk from 'redux-thunk'
import { persistStore } from 'redux-persist'

const reducers = combineReducers({
  user: userReducer
})
const persistConfig = {
  key: 'pmail',
  storage,
  whitelist: ['user']
}
const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
  devTools: import.meta.env.NODE_ENV !== 'production'
})
const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export { store, persistor }
