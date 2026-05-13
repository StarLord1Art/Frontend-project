import { configureStore } from '@reduxjs/toolkit'
import TodoReducer from './reducers/slices/TodoSlice'
import ModalReducer from './reducers/slices/ModalSlice'
import AuthReducer from './reducers/slices/AuthSlice'

export const store = configureStore({
  reducer: {
    TodoReducer,
    ModalReducer,
    AuthReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
