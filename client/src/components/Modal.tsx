import React from "react";
import {Modal} from "antd";

interface ModalProps {
    title: string;
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    footer: React.ReactNode[];
    children: React.ReactNode;
}

const ModalAntd: React.FC<{
    title: string;
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    footer: React.ReactNode[];
    children: React.ReactNode;
}> = (props: ModalProps) => {
    return (
        <Modal
            title={props.title}
            open={props.open}
            onOk={props.onOk}
            onCancel={props.onCancel}
            footer={props.footer}
        >
            {props.children}
        </Modal>
    )
}

export default ModalAntd;
