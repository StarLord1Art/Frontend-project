import React from "react";
import {useNavigate} from "react-router-dom";
import {Result, Button} from "antd";
import {useAppSelector} from "../hooks/redux";

const Error: React.FC = () => {
    const navigate = useNavigate();
    const {error} = useAppSelector(state => state.TodoReducer);

    return (
        <Result
            status="error"
            title="Извините, что-то пошло не так."
            subTitle={error}
            extra={<Button type="primary" onClick={() => {
                navigate("/")
            }}>На главную</Button>}
        />
    )
}

export default Error;
