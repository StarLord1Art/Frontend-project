import React, {useEffect} from 'react';
import {Breadcrumb, Layout, theme, Typography, Button, Input} from 'antd';
import {PlusOutlined} from "@ant-design/icons";
import {Link, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../hooks/redux";
import {createTask, fetchTodos} from "../store/reducers/ActionCreators";
import {modalSlice} from "../store/reducers/slices/ModalSlice";
import HeaderAntd from "../components/Header";
import FooterAntd from "../components/Footer";
import ModalAntd from "../components/Modal";
import TodoList from "../components/TodoList";

const { Content } = Layout;
const {Title} = Typography;
const { TextArea } = Input;

const Main: React.FC = () => {
    const dispatch = useAppDispatch();
    const {isOpen, isModalLoading, title, description} = useAppSelector(state => state.ModalReducer);
    const {error} = useAppSelector(state => state.TodoReducer)
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchTodos())
    }, [dispatch])

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    function handleCancel() {
        dispatch(modalSlice.actions.closeModal())
    }

    function createTodo() {
        dispatch(modalSlice.actions.changeIsModalLoading(true))
        dispatch(createTask(title, description))
        if (error !== '') {
            dispatch(modalSlice.actions.changeIsModalLoading(false))
            dispatch(modalSlice.actions.closeModal())
            navigate('/error', {
                state: {error: error},
            })
        } else {
            dispatch(modalSlice.actions.changeIsModalLoading(false))
            dispatch(modalSlice.actions.closeModal())
        }
    }

    return (
        <Layout>
            <HeaderAntd/>
            <Content style={{ padding: '0 48px' }}>
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                >
                    <Breadcrumb.Item>
                        <Link to={{pathname: '/'}}>Главная</Link>
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
                    <div style={{marginTop: '5%'}}>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <Title>Все задачи</Title>
                            <Button type={'text'} style={{alignSelf: 'center', marginTop: '2%'}} onClick={() => {
                                dispatch(modalSlice.actions.openModal())
                            }} icon={<PlusOutlined />}>Создать задачу</Button>
                        </div>
                        <ModalAntd
                            title={"Создание задачи"}
                            open={isOpen}
                            confirmLoading={isModalLoading}
                            onOk={createTodo}
                            onCancel={handleCancel}
                            footer={[
                                <Button key="back" onClick={handleCancel}>
                                    Отменить
                                </Button>,
                                <Button key="submit" type="primary" loading={isModalLoading} onClick={createTodo}>
                                    Создать
                                </Button>
                            ]}
                        >
                            <Input value={title} onChange={(event) => {
                                dispatch(modalSlice.actions.changeTitle(event.target.value))
                            }} style={{marginBottom: "0.5rem"}} placeholder="Введите название задачи"/>
                            <TextArea value={description} onChange={(event) => {
                                dispatch(modalSlice.actions.changeDescription(event.target.value))
                            }} rows={4} placeholder="Введите описание задачи"/>
                        </ModalAntd>
                        <TodoList/>
                    </div>
                </div>
            </Content>
            <FooterAntd/>
        </Layout>
    )
}

export default Main;
