import {AppDispatch} from "../store";
import {ITodo} from "../../models/ITodo";
import {todoSlice} from "./slices/TodoSlice";
import {NavigateFunction} from "react-router-dom";
import {Dispatch, SetStateAction} from "react";

export const fetchTodos = (navigate: NavigateFunction) => (dispatch: AppDispatch) => {
    try {
        dispatch(todoSlice.actions.todosFetching())
        fetch('/api/v1/tasks', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        }).then(res => res.json()).then((data: ITodo[]) => {
            dispatch(todoSlice.actions.todosFetchSuccess(data))
        })
    } catch (err: any) {
        dispatch(todoSlice.actions.todosFetchError(err.message))
        navigate('/error')
    }
}

export const createTask = (title: string, description: string, navigate: NavigateFunction, setTitle: Dispatch<SetStateAction<string>>, setDescription: Dispatch<SetStateAction<string>>, setIsOpen: Dispatch<SetStateAction<boolean>>, setIsModalLoading: Dispatch<SetStateAction<boolean>>) => (dispatch: AppDispatch) => {
    try {
        setIsModalLoading(true);
        fetch('/api/v1/tasks', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: description,
            })
        }).then(res => res.json()).then((data: ITodo) => {
            setIsModalLoading(false);
            setIsOpen(false);
            setTitle('')
            setDescription('')
            dispatch(todoSlice.actions.taskCreateSuccess(data))
        })
    } catch (err: any) {
        setIsModalLoading(false);
        setIsOpen(false);
        setTitle('')
        setDescription('')
        dispatch(todoSlice.actions.taskCreateError(err.message))
        navigate('/error')
    }
}

export const updateTaskStatus = (id: number, title: string, description: string, status: boolean, isStatusUpdated: boolean, tags: string[], navigate: NavigateFunction) => (dispatch: AppDispatch) => {
    try {
        fetch('/api/v1/tasks', {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
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
            dispatch(todoSlice.actions.taskUpdateSuccess(data))
        })
    } catch (error: any) {
        dispatch(todoSlice.actions.taskUpdateError(error.message))
        navigate('/error')
    }
}

export const updateTask = (id: number, title: string, description: string, status: boolean, isStatusUpdated: boolean, tags: string[], navigate: NavigateFunction, setIsOpen: Dispatch<SetStateAction<boolean>>, setIsModalLoading: Dispatch<SetStateAction<boolean>>) => (dispatch: AppDispatch) => {
    try {
        setIsModalLoading(true);
        fetch('/api/v1/tasks', {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
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
            setIsModalLoading(false);
            setIsOpen(false);
            dispatch(todoSlice.actions.taskUpdateSuccess(data))
            navigate('/')
        })
    } catch (err: any) {
        setIsModalLoading(false);
        setIsOpen(false);
        dispatch(todoSlice.actions.taskUpdateError(err.message))
        navigate('/error')
    }
}

export const deleteTask = (id: number, navigate: NavigateFunction) => (dispatch: AppDispatch) => {
    try {
        fetch(`/api/v1/tasks?id=${id}`, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
        }).then(res => res.text()).then(() => {
            dispatch(todoSlice.actions.taskDeleteSuccess(id))
            navigate('/')
        })
    } catch (err: any) {
        dispatch(todoSlice.actions.taskDeleteError(err.message))
        navigate('/error')
    }
}
