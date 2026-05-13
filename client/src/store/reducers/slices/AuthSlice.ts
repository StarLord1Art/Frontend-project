import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface User {
    userName: string;
    createdAt: number;
}

export interface AuthState {
    user: User | null,
    loading: boolean,
    error: string | null,
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },
        loginFail(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        logoutStart(state) {
            state.loading = true;
        },
        logoutSuccess(state) {
            state.user = null;
            state.loading = false;
        },
        logoutFail(state, action: PayloadAction<string>) {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export default authSlice.reducer;
