import React from "react";
import {Button, Layout, message} from "antd"
import {useAppDispatch, useAppSelector} from "../hooks/redux";
import {modalSlice} from "../store/reducers/slices/ModalSlice";
import AuthModal from "./AuthModal";
import {authSlice} from "../store/reducers/slices/AuthSlice";
import {useNavigate} from "react-router-dom";

const {Header} = Layout;

const HeaderAntd: React.FC = () => {
    const dispatch = useAppDispatch();
    const {user, loading} = useAppSelector(state => state.AuthReducer);
    const navigate = useNavigate();

    function login() {
        dispatch(modalSlice.actions.openModal());
    }

    async function logout() {
        dispatch(authSlice.actions.logoutStart());
        fetch("/api/v1/logout", {
            method: "POST",
            credentials: "include",
            mode: "cors",
        }).then(() => {
            dispatch(authSlice.actions.logoutSuccess());
            navigate("/");
        }).catch(err => {
            console.log(err.message);
            dispatch(authSlice.actions.logoutFail(err.message));
            message.error("Что-то пошло не так, попробуйте ещё раз");
        })
    }

    return (
        <>
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{width: '5%'}} />
                <Button
                    type={"primary"}
                    onClick={user === null ? login : logout}
                    loading={loading}
                >
                    {user === null ? "Войти" : "Выйти"}
                </Button>
            </Header>

            <AuthModal />
        </>
    )
}

export default HeaderAntd;
