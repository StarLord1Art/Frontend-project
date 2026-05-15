import {Button, Form, Input, message, Modal, Tabs} from "antd";
import React from "react";
import {useAppDispatch, useAppSelector} from "../hooks/redux";
import {modalSlice} from "../store/reducers/slices/ModalSlice";
import {authSlice, User} from "../store/reducers/slices/AuthSlice";
import {fetchTodos} from "../store/reducers/ActionCreators";
import {useNavigate} from "react-router-dom";

const AuthModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const {isOpen, isModalLoading} = useAppSelector(state => state.ModalReducer);
    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();
    const navigate = useNavigate();

    const handleLogin = async (values: {userName: string, password: string}) => {
        dispatch(modalSlice.actions.changeIsModalLoading(true));
        fetch("/api/v1/signin", {
            method: "POST",
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        }).then(res => {
            if (res.status === 200) {
                res.json().then((user: User)=> {
                    dispatch(authSlice.actions.loginSuccess(user));
                    dispatch(fetchTodos(navigate));
                })
            } else if (res.status === 400 || res.status === 404) {
                res.text().then((str) => {
                    message.error(str);
                })
            }
        }).catch(err => {
            console.log(err.message);
            dispatch(authSlice.actions.loginFail(err.message));
            message.error("Что-то пошло не так, попробуйте ещё раз");
        }).finally(() => {
            dispatch(modalSlice.actions.changeIsModalLoading(false));
            dispatch(modalSlice.actions.closeModal());
            loginForm.resetFields();
        })
    };

    const handleRegister = async (values: {userName: string, password: string}) => {
        dispatch(modalSlice.actions.changeIsModalLoading(true));
        fetch("/api/v1/signup", {
            method: "POST",
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        }).then(res => {
            if (res.status === 200) {
                message.success("Вы успешно зарегистрировались");
                message.info("Войдите в аккаунт, чтобы продолжить");
            } else if (res.status === 400) {
                res.text().then((str) => {
                    message.error(str);
                })
            }
        }).catch(err => {
            console.log(err.message);
            message.error("Что-то пошло не так, попробуйте ещё раз");
        }).finally(() => {
            dispatch(modalSlice.actions.changeIsModalLoading(false));
            dispatch(modalSlice.actions.closeModal());
            registerForm.resetFields();
        })
    };

    return (
        <Modal
            open={isOpen}
            confirmLoading={isModalLoading}
            onCancel={() => {
                dispatch(modalSlice.actions.closeModal());
                registerForm.resetFields();
                loginForm.resetFields();
            }}
            footer={null}
        >
            <Tabs
                defaultActiveKey="login"
                items={[
                    {
                        key: "login",
                        label: "Войти",
                        children: (
                            <Form
                                form={loginForm}
                                layout="vertical"
                                onFinish={handleLogin}
                            >
                                <Form.Item
                                    label="Имя пользователя"
                                    name="userName"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Введите имя пользователя",
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    label="Пароль"
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Введите пароль",
                                        },
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    block
                                    htmlType="submit"
                                >
                                    Войти
                                </Button>
                            </Form>
                        ),
                    },
                    {
                        key: "register",
                        label: "Регистрация",
                        children: (
                            <Form
                                form={registerForm}
                                layout="vertical"
                                onFinish={handleRegister}
                            >
                                <Form.Item
                                    label="Имя пользователя"
                                    name="userName"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Введите имя пользователя",
                                        },
                                    ]}
                                >
                                    <Input placeholder={"Имя пользователя должно быть уникальным"} />
                                </Form.Item>

                                <Form.Item
                                    label="Пароль"
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Введите пароль",
                                        },
                                        {
                                            pattern:
                                                // eslint-disable-next-line no-useless-escape
                                                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]{8,20}$/,
                                            message:
                                                "Пароль должен содержать 8+ латинских символов, строчную и заглавную букву, цифру и спецсимвол",
                                        },
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item
                                    label="Повторите пароль"
                                    name="confirm"
                                    dependencies={["password"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Повторите пароль",
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (
                                                    !value ||
                                                    getFieldValue("password") === value
                                                ) {
                                                    return Promise.resolve();
                                                }

                                                return Promise.reject(
                                                    new Error("Пароли не совпадают")
                                                );
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                >
                                    Зарегистрироваться
                                </Button>
                            </Form>
                        ),
                    },
                ]}
            />
        </Modal>
    )
}

export default AuthModal;
