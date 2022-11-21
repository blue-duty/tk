import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import {Select} from "antd";
import {Option} from "antd/es/mentions";
import TextArea from "antd/es/input/TextArea";


const PlanReportModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

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
                <Form.Item label="任务名称" name='name' rules={[{required: true, message: '请输入任务名称'}]}>
                    <Input  text="请输入任务名称"/>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    name="form_name"
                    label="报表类型"
                    initialValue=""
                    rules={[{required: true}]}
                >

                    <Select onChange={null}>
                        <Option value="用户访问">用户访问</Option>
                        <Option value="登录方式">登录方式</Option>
                        <Option value="用户源IP访问数">用户源IP访问数</Option>
                        <Option value="主机访问">主机访问</Option>
                        <Option value="协议访问">协议访问</Option>
                        <Option value="命令统计">命令统计</Option>
                        <Option value="会话时长">会话时长</Option>
                        <Option value="运维时间分布">运维时间分布</Option>

                    </Select>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    name="cycle"
                    label="执行周期"
                    initialValue=""
                    rules={[{required: true}]}
                >

                    <Select onChange={null}>
                        <Option value="天">按天</Option>
                        <Option value="周">按周</Option>
                        <Option value="月">按月</Option>

                    </Select>
                </Form.Item>

                <Form.Item label="执行时间" name='first_time' rules={[{required: true, message: '执行时间'}]}
                           tooltip={<span>按天:0~23<br/>按周:1~7<br/>按月：1~31,31代表每月最后一天</span>}>
                    <Input type="number"/>
                </Form.Item>

                <Form.Item label="描述" name='describe' rules={[{required: false}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="在此处填写描述"/>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default PlanReportModal;
