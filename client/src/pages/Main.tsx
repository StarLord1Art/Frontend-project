import React, {useEffect, useState} from 'react';
import {Breadcrumb, Layout, theme, Typography, Button, Input, message} from 'antd';
import {PlusOutlined} from "@ant-design/icons";
import {Link, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../hooks/redux";
import {createTask, fetchTodos} from "../store/reducers/ActionCreators";
import {modalSlice} from "../store/reducers/slices/ModalSlice";
import HeaderAntd from "../components/Header";
import FooterAntd from "../components/Footer";
import ModalAntd from "../components/TaskModal";
import TodoList from "../components/TodoList";
import {authSlice, User} from "../store/reducers/slices/AuthSlice";

const { Content } = Layout;
const {Title, Text, Paragraph} = Typography;
const { TextArea } = Input;

const Main: React.FC = () => {
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const {isOpen, isModalLoading} = useAppSelector(state => state.ModalReducer);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const {user} = useAppSelector(state => state.AuthReducer);

    useEffect(() => {
        fetch("/api/v1/me", {
            method: "GET",
            credentials: "include",
            mode: "cors",
        }).then((res) => {
            if (res.status === 200) {
                res.json().then((user: User) => {
                    dispatch(authSlice.actions.loginSuccess(user));
                    dispatch(fetchTodos(navigate));
                });
            } else if (res.status === 401) {
                res.text().then(str => {
                    dispatch(authSlice.actions.loginFail(str));
                })
            }
        }).catch(err => {
            console.log(err.message);
        })
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

        dispatch(createTask(title, description, navigate, setTitle, setDescription));
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
                    {user === null ? (
                        <div>
                            <Title>Добро пожаловать!</Title>
                            <Paragraph>
                                Пожалуйста, зарегистрируйтесь и войдите в аккаунт, чтобы начать пользоваться приложением.
                            </Paragraph>
                            <Text type={"secondary"}>
                                Проект создал Лепёшкин Артём Дмитриевич, студент второго курса ВШПИ МФТИ.
                            </Text>
                        </div>
                    ) : (
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
                    )}
                </div>
            </Content>
            <FooterAntd/>
        </Layout>
    )
}

export default Main;
