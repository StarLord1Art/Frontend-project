import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface ModalState {
    isOpen: boolean,
    isModalLoading: boolean,
    title: string,
    description: string,
}

const initialState: ModalState = {
    isOpen: false,
    isModalLoading: false,
    title: "",
    description: "",
}

export const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        closeModal(state) {
            state.isOpen = false;
            state.title = "";
            state.description = "";
        },
        openModal(state) {
            state.isOpen = true;
        },
        changeTitle(state, action: PayloadAction<string>) {
            state.title = action.payload;
        },
        changeDescription(state, action: PayloadAction<string>) {
            state.description = action.payload;
        },
    }
})

export default modalSlice.reducer
