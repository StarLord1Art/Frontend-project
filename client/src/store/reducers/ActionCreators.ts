import {AppDispatch} from "../store";
import {ITodo} from "../../models/ITodo";
import {todoSlice} from "./slices/TodoSlice";
import {modalSlice} from "./slices/ModalSlice";
import {NavigateFunction} from "react-router-dom";

export const fetchTodos = (navigate: NavigateFunction) => (dispatch: AppDispatch) => {
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
        navigate('/error')
    }
}

export const createTask = (title: string, description: string, navigate: NavigateFunction) => (dispatch: AppDispatch) => {
    try {
        dispatch(modalSlice.actions.changeIsModalLoading(true))
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
            dispatch(modalSlice.actions.changeIsModalLoading(false))
            dispatch(modalSlice.actions.closeModal())
            dispatch(todoSlice.actions.taskCreateSuccess(data))
        })
    } catch (err: any) {
        dispatch(modalSlice.actions.changeIsModalLoading(false))
        dispatch(modalSlice.actions.closeModal())
        dispatch(todoSlice.actions.taskCreateError(err.message))
        navigate('/error')
    }
}

export const updateTask = (id: number, title: string, description: string, status: boolean, isStatusUpdated: boolean, tags: string[], navigate: NavigateFunction) => (dispatch: AppDispatch) => {
    try {
        dispatch(modalSlice.actions.changeIsModalLoading(true))
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
                tags: tags,
            })
        }).then(res => res.json()).then((data: ITodo) => {
            dispatch(modalSlice.actions.changeIsModalLoading(false))
            dispatch(modalSlice.actions.closeModal())
            dispatch(todoSlice.actions.taskUpdateSuccess(data))
            if (!isStatusUpdated) {
                navigate('/')
            }
        })
    } catch (err: any) {
        dispatch(modalSlice.actions.changeIsModalLoading(false))
        dispatch(modalSlice.actions.closeModal())
        dispatch(todoSlice.actions.taskUpdateError(err.message))
        navigate('/error')
    }
}

export const deleteTask = (id: number, navigate: NavigateFunction) => (dispatch: AppDispatch) => {
    try {
        fetch(`/api/v1/tasks?id=${id}`, {
            method: 'DELETE',
            mode: 'cors',
        }).then(res => res.text()).then(() => {
            dispatch(todoSlice.actions.taskDeleteSuccess(id))
            navigate('/')
        })
    } catch (err: any) {
        dispatch(todoSlice.actions.taskDeleteError(err.message))
        navigate('/error')
    }
}
