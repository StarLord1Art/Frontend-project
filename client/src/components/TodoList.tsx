import React from "react";
import {Checkbox, Empty, List, Spin, Tag, Typography} from "antd";
import {updateTask} from "../store/reducers/ActionCreators";
import {useAppDispatch, useAppSelector} from "../hooks/redux";
import {useNavigate} from "react-router-dom";

const TodoList: React.FC = () => {
    const dispatch = useAppDispatch();
    const {todos, isLoading} = useAppSelector(state => state.TodoReducer)
    const navigate = useNavigate();

    return(
        <>
            {isLoading
                ? <Spin size="large" style={{marginTop: '5rem'}}/>
                : todos.length === 0
                    ? <Empty style={{marginTop: '5rem'}} description={<Typography.Text>Задач нет</Typography.Text>}/>
                    : <List
                        style={{width: '50vw', margin: '0 auto'}}
                        bordered
                        dataSource={todos}
                        renderItem={todo => (
                            <List.Item key={todo.id} style={{display: 'flex', justifyContent: 'left'}}>
                                <Checkbox checked={todo.task.completed} onClick={() => {
                                    dispatch(updateTask(todo.id, todo.task.title, todo.task.description, !todo.task.completed, true, todo.task.tags, navigate))
                                }}/>
                                <span style={{cursor: 'pointer', marginLeft: '0.5rem'}} onClick={() => {
                                    navigate(`todo/${todo.id}`, {
                                        state: {
                                            todo: todo
                                        }
                                    })
                                }}>{todo.task.title}</span>
                                {todo.task.completed
                                    ? <span style={{marginLeft: 'auto'}}><Tag variant={'filled'} color={'green'}>Выполнено</Tag></span>
                                    : <span style={{marginLeft: 'auto'}}><Tag variant={'filled'} color={'red'}>Не выполнено</Tag></span>
                                }
                            </List.Item>
                        )}
                    />
            }
        </>
    )
}

export default TodoList;
