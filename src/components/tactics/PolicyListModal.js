import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import {InputNumber,Select} from "antd";


const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const PolicyListModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

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
                    label="策略名称"
                    name='name'
                    rules={[
                        { required: true, message: '请输入策略名称'}
                    ]}>
                    <Input placeholder="请输入策略名称"/>
                </Form.Item>

                <Form.Item label="优先级" name='priority' rules={[{required: true, message: '请输入优先级'}]}>
                    <InputNumber style={{ width: '100%'}} />
                </Form.Item>

                <Form.Item label="执行行动" name="policyType">
                    <Select>
                        <Select.Option value="允许执行">允许执行</Select.Option>
                        <Select.Option value="指令申请">指令申请</Select.Option>
                        <Select.Option value="指令阻断">指令阻断</Select.Option>
                        <Select.Option value="会话阻断">会话阻断</Select.Option>
                    </Select>
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

export default PolicyListModal;
