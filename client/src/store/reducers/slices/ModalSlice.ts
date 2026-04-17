import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface ModalState {
    isOpen: boolean,
    isModalLoading: boolean,
}

const initialState: ModalState = {
    isOpen: false,
    isModalLoading: false,
}

export const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        closeModal(state) {
            if (state.isOpen) {
                state.isOpen = false;
            }
        },
        openModal(state) {
            state.isOpen = true;
        },
        changeIsModalLoading(state, action: PayloadAction<boolean>) {
            if (state.isOpen) {
                state.isModalLoading = action.payload;
            }
        }
    }
})

export default modalSlice.reducer;
