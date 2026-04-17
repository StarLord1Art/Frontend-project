import React, {useEffect, useState} from 'react';
import {Breadcrumb, Layout, theme, Typography, Button, Input, message} from 'antd';
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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const {isOpen, isModalLoading} = useAppSelector(state => state.ModalReducer);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        dispatch(fetchTodos(navigate));
    }, [dispatch, navigate])

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    function handleCancel() {
        dispatch(modalSlice.actions.closeModal());
        setTitle('');
        setDescription('');
    }

    const showError = () => {
        messageApi.open({
            type: 'error',
            content: 'Пожалуйста, введите название задачи!',
        });
    }

    function createTodo() {
        if (title.trim() === "") {
            showError();
            return
        }

        dispatch(createTask(title, description, navigate));
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
                        <Link to={{pathname: '/'}}>Главная</Link>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        padding: 24,
                        minHeight: '88vh',
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <div style={{marginTop: '2rem'}}>
                        <div style={{display: 'flex', width: '50vw', margin: '0 auto', justifyContent: 'space-between'}}>
                            <Title>Все задачи</Title>
                            <Button
                                type={'text'}
                                style={{alignSelf: 'center', marginTop: '1.25rem'}}
                                onClick={() => {
                                    dispatch(modalSlice.actions.openModal())
                                }}
                                icon={<PlusOutlined />}
                            >
                                Создать задачу
                            </Button>
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
                                setTitle(event.target.value);
                            }} style={{marginBottom: "0.5rem"}} placeholder="Введите название задачи"/>
                            <TextArea value={description} onChange={(event) => {
                                setDescription(event.target.value);
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
