import {AppDispatch} from "../store";
import {ITodo} from "../../models/ITodo";
import {todoSlice} from "./slices/TodoSlice";

export const fetchTodos = () => (dispatch: AppDispatch) => {
    try {
        dispatch(todoSlice.actions.todosFetching())
        fetch('/api/v1/tasks', {
            method: 'GET',
            mode: 'cors',
        }).then(res => res.json()).then((data: ITodo[]) => {
            dispatch(todoSlice.actions.todosFetchSuccess(data))
        })
    } catch (err: any) {
        dispatch(todoSlice.actions.todosFetchError(err.message))
    }
}

export const createTask = (title: string, description: string) => (dispatch: AppDispatch) => {
    try {
        fetch('/api/v1/tasks', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: description,
            })
        }).then(res => res.json()).then((data: ITodo) => {
            dispatch(todoSlice.actions.taskCreateSuccess(data))
        })
    } catch (err: any) {
        dispatch(todoSlice.actions.taskCreateError(err.message))
    }
}

export const updateTask = (id: number, title: string, description: string, status: boolean, isStatusUpdated: boolean) => (dispatch: AppDispatch) => {
    try {
        fetch('/api/v1/tasks', {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                newTitle: title,
                newDescription: description,
                newCompleted: status,
                isStatusUpdated: isStatusUpdated,
            })
        }).then(res => res.json()).then((data: ITodo) => {
            dispatch(todoSlice.actions.taskUpdateSuccess(data))
        })
    } catch (err: any) {
        dispatch(todoSlice.actions.taskUpdateError(err.message))
    }
}

export const deleteTask = (id: number) => (dispatch: AppDispatch) => {
    try {
        fetch(`/api/v1/tasks?id=${id}`, {
            method: 'DELETE',
            mode: 'cors',
        }).then(res => res.text()).then(() => {
            dispatch(todoSlice.actions.taskDeleteSuccess(id))
        })
    } catch (err: any) {
        dispatch(todoSlice.actions.taskDeleteError(err.message))
    }
}
