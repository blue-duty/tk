import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import {Checkbox} from "antd";


const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const OrderContentModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

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
                    label="指令/参数"
                    name='content'
                    rules={[
                        { required: true, message: '请输入指令/参数'},
                    ]}>
                    <Input placeholder="请输入指令/参数"/>
                </Form.Item>

                <Form.Item
                    label="是否正则"
                    valuePropName='checked'
                    name="regular"
                    >
                    <Checkbox/>
                </Form.Item>

                <Form.Item
                    label="风险描述"
                    name='describe'
                >
                    <Input.TextArea placeholder="请输入描述" />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default OrderContentModal;
