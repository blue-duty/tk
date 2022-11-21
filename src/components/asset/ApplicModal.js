import React, {useEffect, useState} from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import {Select} from "antd";
import request from "../../common/request";

const {TextArea} = Input;

// 子级页面
// Ant form create 表单内置方法

const ApplicModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 18},
    };

    for (let key in model) {
        if (model[key] === '-') {
            model[key] = '';
        }
    }

    let [applicationServerName, setApplicationServerName] = useState([]);
    let [programName, setProgramName] = useState([]);

    useEffect(() => {
        const getApplicationServer = async () => {
            const result = await request.get('/appserver');
            if (result.code === 1) {
                if (result.code === 1) {
                    setApplicationServerName(result['data']);
                }
            }
        }
        getApplicationServer();
        handleAppServe(model["applicationServerName"])
    },[model]);

    const handleAppServe = async (id)=> {
        const result = await request.get(`/appserver/${id}/program`)
        if (result.code === 1) {
            if (result.code === 1) {
                setProgramName(result['data']);
            }
        }
    }

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

                <Form.Item label="应用服务器" name='applicationServerName' rules={[{required: true, message: '请选择应用服务器名称'}]}>
                    <Select onChange={handleAppServe} allowClear placeholder='请选择应用服务器' disabled={JSON.stringify(model) !== '{}'}>
                        {
                            applicationServerName.map(item => {
                                return <Select.Option key={item.id}
                                    value={item['id']}>{item['name']}</Select.Option>
                            })
                        }
                    </Select>
                </Form.Item>

                <Form.Item label="应用名称" name='name' rules={[{required: true, message: '请输入应用名称'}]}>
                    <Input placeholder="请输入应用名称"/>
                </Form.Item>

                <Form.Item name="programName" label="程序" rules={[{required: true, message: '请选择程序'}]}>
                    <Select allowClear placeholder='请选择程序' disabled={JSON.stringify(model) !== '{}'}>
                        {
                            programName.map(item => {
                                return <Select.Option key={item.id}
                                    value={item['id']}>{item['name']}</Select.Option>
                            })
                        }
                    </Select>
                </Form.Item>

                <Form.Item label="参数" name='param'>
                    <Input placeholder="请输入参数"/>
                </Form.Item>

                <Form.Item label="描述" name='info'>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="请输入描述"/>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default ApplicModal;
