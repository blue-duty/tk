import React from 'react';
import {Form, Input, Modal,InputNumber,Select} from "antd/lib/index";

// 子级页面
// Ant form create 表单内置方法
const {Option} = Select;
const {TextArea} = Input;

const ApplicSerModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 18},
    };

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


                <Form.Item label="服务器名称" name='name' rules={[{required: true, message: '请输入应用服务器名称'}]}>
                    <Input placeholder="应用服务器名称"/>
                </Form.Item>

                <Form.Item label="服务器IP" name='ip' rules={[{required: true, message: '请输入应用服务器的IP地址'}]}>
                <Input placeholder="应用服务器的IP地址"/>
                </Form.Item>

                <Form.Item name="type" label="服务器类型"  rules={[{required: true, message: '请输入应用服务器的类型'}]}>
                    <Select>
                        <Option value="Windows">Windows</Option>
                        {/*<Option value="Linux">Linux</Option>*/}
                    </Select>
                </Form.Item>

                <Form.Item label="端口号" name='port' rules={[{required: true, message: '请输入端口号'}]}>
                    <InputNumber min={1} max={65535} placeholder='TCP端口'/>
                </Form.Item>

                <Form.Item label="授权账户" name='passport' rules={[{required: true, message: '请输入授权账户'}]}>
                    <Input placeholder="输入授权账户"/>
                </Form.Item>

                <Form.Item label="授权密码" name='password' rules={[{required: true, message: '请输入授权密码'}]}>
                    <Input.Password placeholder="输入授权密码"/>
                </Form.Item>

                <Form.Item label="描述" name='info'>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="请输入描述"/>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default ApplicSerModal;
