import {ITodo} from "../../../models/ITodo";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface TodoState {
    todos: ITodo[],
    isLoading: boolean,
    error: string
}

const initialState: TodoState = {
    todos: [],
    isLoading: false,
    error: '',
}

export const todoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        todosFetching(state) {
            state.isLoading = true;
        },
        todosFetchSuccess(state, action: PayloadAction<ITodo[]>) {
            state.isLoading = false;
            state.todos = action.payload;
            state.error = '';
        },
        todosFetchError(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
        },
        taskCreateSuccess(state, action: PayloadAction<ITodo>) {
            state.todos.push(action.payload)
            state.error = '';
        },
        taskCreateError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        taskUpdateSuccess(state, action: PayloadAction<ITodo>) {
            for (let i = 0; i < state.todos.length; i++) {
                if (state.todos[i].id === action.payload.id) {
                    state.todos[i] = action.payload
                }
            }
            state.error = ''
        },
        taskUpdateError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        taskDeleteSuccess(state, action: PayloadAction<number>) {
            state.todos = state.todos.filter(todo => todo.id !== action.payload)
            state.error = ''
        },
        taskDeleteError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        }
    }
})

export default todoSlice.reducer
