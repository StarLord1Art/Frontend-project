import React from 'react';
import {Breadcrumb, Layout, Typography, theme, Divider, Button, Tag, Input} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';
import {Link, useLocation} from "react-router-dom";
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

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
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
                            }} icon={<DeleteOutlined/>} style={{marginLeft: '0.5rem'}} danger>Удалить</Button>
                        </div>
                        <ModalAntd
                            title={"Редактирование задачи"}
                            open={isOpen}
                            onOk={() => {
                                dispatch(updateTask(state.todo.id, title, description, state.todo.task.completed))
                            }}
                            onCancel={() => {
                                dispatch(modalSlice.actions.closeModal())
                            }}
                            footer={[
                                <Button key="back" onClick={() => {
                                    dispatch(modalSlice.actions.closeModal())
                                }}>
                                    Отменить
                                </Button>,
                                <Button key="submit" type="primary" loading={isModalLoading} onClick={() => {
                                    dispatch(updateTask(state.todo.id, title, description, state.todo.task.completed))
                                }}>
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
