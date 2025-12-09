import React from "react";
import {Layout} from "antd";

const {Footer} = Layout;

const FooterAntd: React.FC = () => {
    return (
        <Footer style={{ textAlign: 'center' }}>
            Todo App ©{new Date().getFullYear()}
        </Footer>
    )
}

export default FooterAntd;
