import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import { DatePicker } from 'antd';

const {TextArea} = Input;

// 子级页面
// Ant form create 表单内置方法

const WorkOrderApplyModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

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

                <Form.Item label="工单名称" name='name' rules={[{required: true, message: '请输入工单名称'}]}>
                    <Input placeholder="请输入工单名称"/>
                </Form.Item>

                <Form.Item name="beginTime" label="运维开始时间" rules={[{required: true, message: '请输入运维开始时间'}]}>
                    <DatePicker showTime showNow={false} format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>

                <Form.Item name="endTime" label="运维结束时间" rules={[{required: true, message: '请输入运维开始时间'}]}>
                    <DatePicker showTime showNow={false} format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>

                <Form.Item label="描述" name='describe'>
                    <TextArea autoSize={{minRows: 5}} placeholder="请输入描述"/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default WorkOrderApplyModal;
