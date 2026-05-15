import { configureStore } from '@reduxjs/toolkit'
import TodoReducer from './reducers/slices/TodoSlice'
import AuthReducer from './reducers/slices/AuthSlice'

export const store = configureStore({
  reducer: {
    TodoReducer,
    AuthReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
