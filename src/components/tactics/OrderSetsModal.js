import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";


const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const OrderSetsModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

    const [form] = Form.useForm();

    return (
        <Modal
            title={title}
            visible={visible}
            maskClosable={false}

            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        handleOk(values);
                    })
                    .catch(info => {
                    });
            }}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
            centered={true}
            cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
        >

            <Form form={form} {...formItemLayout} initialValues={model} size='small'>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item
                    label="指令集名称"
                    name='name'
                    rules={[
                        { required: true, message: '请输入指令集名称'},
                    ]}>
                    <Input placeholder="请输入指令集名称"/>
                </Form.Item>

                <Form.Item
                    label="描述"
                    name='describe'
                    >
                    <Input.TextArea placeholder="请输入描述" />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default OrderSetsModal;
