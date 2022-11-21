import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";


// 子级页面
// Ant form create 表单内置方法

const StaticRouteModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

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
                <Form.Item name='key' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                {
                    JSON.stringify(model) === '{}' ?
                        <Form.Item label="网卡名称" name='networkCard' rules={[{required: true, message: '请输入网卡名称'}]}>
                            <Input placeholder="请输入网卡名称"/>
                        </Form.Item> :
                        <Form.Item label="网卡名称" name='networkCard' rules={[{required: true, message: '请输入网卡名称'}]}>
                            <Input disabled placeholder="网卡名称"/>
                        </Form.Item>
                }

                <Form.Item label="目的地址" name='desAddres' rules={[{required: true, message: '请输入目的地址'}]}>
                    <Input placeholder="请输入目的地址"/>
                </Form.Item>

                <Form.Item label="子网掩码" name='subnetMask' rules={[{required: true, message: '请输入子网掩码'}]}>
                    <Input placeholder="请输入子网掩码"/>
                </Form.Item>

                <Form.Item label="下一跳地址" name='nextHop' rules={[{required: true, message: '请输入下一跳地址'}]}>
                    <Input placeholder="请输入下一跳地址"/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default StaticRouteModal;
