import React from "react";
import {Layout} from "antd"

const {Header} = Layout;

const HeaderAntd: React.FC = () => {
    return (
        <Header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <div className="demo-logo" />
        </Header>
    )
}

export default HeaderAntd;
