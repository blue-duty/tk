import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import {Checkbox, InputNumber} from "antd";


const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 12},
};

const formCheckLayout = {
    wrapperCol: {span: 10,offset: 6},
};

const SecretStrategyModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

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
                    label="计划名称"
                    name='encryptName'
                    rules={[
                        { required: true, message: '请输入名称'},
                        { max: 64, message: '输入内容应不超过64个字符' },
                    ]}>
                    <Input placeholder="请输入名称"/>
                </Form.Item>

                <Form.Item label="密码类型" valuePropName='checked' name="hasNum">
                    <Checkbox>密码包含数字</Checkbox>
                </Form.Item>

                <Form.Item {...formCheckLayout} valuePropName='checked' name="hasChar">
                    <Checkbox>密码包含字母</Checkbox>
                </Form.Item>

                <Form.Item {...formCheckLayout} valuePropName='checked' name="hasSpecial">
                    <Checkbox>密码包含特殊字符</Checkbox>
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="改密频率"
                    name="frequency"
                >
                    <InputNumber min={1} addonAfter="天" placeholder="请输入" />
                </Form.Item>

                <Form.Item
                    label="密码不少于"
                    name="length"
                >
                    <InputNumber min={8} max={32} addonAfter="位" placeholder="请输入" />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default SecretStrategyModal;
