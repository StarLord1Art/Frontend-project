import React from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Result, Button} from "antd";

const Error: React.FC = () => {
    const {state} = useLocation()
    const navigate = useNavigate();

    return (
        <Result
            status="error"
            title="Извините, что-то пошло не так."
            subTitle={state.error}
            extra={<Button type="primary" onClick={() => {
                navigate("/")
            }}>На главную</Button>}
        />
    )
}

export default Error;
