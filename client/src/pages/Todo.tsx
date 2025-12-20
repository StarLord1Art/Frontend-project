import React from 'react';
import {Breadcrumb, Layout, Typography, theme, Divider, Button, Tag, Input, message} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';
import {Link, useLocation, useNavigate} from "react-router-dom";
import {deleteTask, updateTask} from "../store/reducers/ActionCreators";
import {modalSlice} from "../store/reducers/slices/ModalSlice";
import {useAppDispatch, useAppSelector} from "../hooks/redux";
import HeaderAntd from "../components/Header";
import FooterAntd from "../components/Footer";
import ModalAntd from '../components/Modal';

const { Content } = Layout;
const {Title} = Typography;
const { TextArea } = Input;

const Todo: React.FC = () => {
    const {state} = useLocation()
    const dispatch = useAppDispatch();
    const {isOpen, isModalLoading, title, description} = useAppSelector(state => state.ModalReducer);
    const {error} = useAppSelector((state) => state.TodoReducer)
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    function handleCancel() {
        dispatch(modalSlice.actions.closeModal())
    }

    const showError = () => {
        messageApi.open({
            type: 'error',
            content: 'Пожалуйста, введите новое название задачи!',
        });
    }

    function updateTodo() {
        if (title.trim() === "") {
            showError();
            return
        }
        dispatch(modalSlice.actions.changeIsModalLoading(true))
        dispatch(updateTask(state.todo.id, title, description, state.todo.task.completed, false, state.todo.task.tags))
        if (error !== '') {
            dispatch(modalSlice.actions.changeIsModalLoading(false))
            dispatch(modalSlice.actions.closeModal())
            navigate('/error', {
                state: { error: error },
            })
        } else {
            dispatch(modalSlice.actions.changeIsModalLoading(false))
            dispatch(modalSlice.actions.closeModal())
            navigate('/');
        }
    }

    return (
        <Layout>
            {contextHolder}
            <HeaderAntd/>
            <Content style={{ padding: '0 48px' }}>
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                >
                    <Breadcrumb.Item>
                        <Link to={{pathname: "/"}}>Главная</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to={{pathname: `todo/${state.todo.id}`}} state={{todo: state.todo}}>Задача</Link>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        padding: 24,
                        minHeight: 800,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div>
                            <Title style={{justifySelf: 'left'}}>{state.todo.task.title}</Title>
                            <Divider/>
                            <h2 style={{justifySelf: 'left'}}>Описание: {state.todo.task.description}</h2>
                            <h2 style={{justifySelf: 'left'}}>Статус: {state.todo.task.completed ? 'Выполнено' : 'Не выполнено'}</h2>
                            <div style={{display: 'flex', justifyContent: 'left'}}>
                                {state.todo.task.tags?.map((tag: string) => (
                                    <span key={tag} style={{display: 'inline-block', marginRight: '0.5rem'}}>
                                        <Tag variant={'filled'} color={'blue'}>{tag}</Tag>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Button type={'primary'} onClick={() => {
                                dispatch(modalSlice.actions.openModal())
                            }} icon={<EditOutlined/>}>Редактировать</Button>
                            <Button type={'primary'} onClick={() => {
                                dispatch(deleteTask(state.todo.id))
                                if (error !== '') {
                                    navigate('/error', {
                                        state: { error: error },
                                    })
                                } else {
                                    navigate('/');
                                }
                            }} icon={<DeleteOutlined/>} style={{marginLeft: '0.5rem'}} danger>Удалить</Button>
                        </div>
                        <ModalAntd
                            title={"Редактирование задачи"}
                            open={isOpen}
                            confirmLoading={isModalLoading}
                            onOk={updateTodo}
                            onCancel={handleCancel}
                            footer={[
                                <Button key="back" onClick={handleCancel}>
                                    Отменить
                                </Button>,
                                <Button key="submit" type="primary" loading={isModalLoading} onClick={updateTodo}>
                                    Редактировать
                                </Button>
                            ]}
                        >
                            <Input value={title} onChange={(event) => {
                                dispatch(modalSlice.actions.changeTitle(event.target.value))
                            }} style={{marginBottom: "0.5rem"}} placeholder="Введите новое название задачи"/>
                            <TextArea value={description} onChange={(event) => {
                                dispatch(modalSlice.actions.changeDescription(event.target.value))
                            }} rows={4} placeholder="Введите новое описание задачи"/>
                        </ModalAntd>
                    </div>
                </div>
            </Content>
            <FooterAntd/>
        </Layout>
    )
}

export default Todo;
