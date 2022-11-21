import React, {useState} from 'react';
import {Form, Input, Modal,Radio} from "antd/lib/index";




const NetwordModal = ({title, visible, handleOk, handleCancel, confirmLoading, model}) => {

    const [form] = Form.useForm();
    let [mode,setMode] = useState(model.mode);

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
                {
                    JSON.stringify(model) === '{}' ?
                        <Form.Item label="网卡名称" name='name' rules={[{required: true, message: '请输入网卡名称'}]}>
                            <Input placeholder="请输入网卡名称"/>
                        </Form.Item> :
                        <Form.Item label="网卡名称" name='name' rules={[{required: true, message: '请输入网卡名称'}]}>
                            <Input disabled placeholder="网卡名称"/>
                        </Form.Item>
                }

                <Form.Item label="状态" name='status'>
                    <Radio.Group>
                        <Radio value='yes'>开启</Radio>
                        <Radio value='no'>关闭</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label="地址模式" name='mode' rules={[{required: true, message: '请选择地址模式'}]}>
                    <Radio.Group onChange={async (e) => {
                        setMode(e.target.value);
                    }}>
                        <Radio value='dhcp'>自动获取</Radio>
                        <Radio value='static'>手动获取</Radio>
                    </Radio.Group>
                </Form.Item>

                {
                    mode === "dhcp" ?
                        <>
                            <Form.Item label="IP地址" name='ip'>
                                <Input disabled placeholder="请输入IP地址"/>
                            </Form.Item>

                            <Form.Item label="子网掩码" name='netmask'>
                                <Input disabled placeholder="请输入子网掩码"/>
                            </Form.Item>

                            <Form.Item label="网关" name='gateway'>
                                <Input disabled placeholder="请输入网关"/>
                            </Form.Item>
                        </>:<>
                            <Form.Item label="IP地址" name='ip' rules={[{required: true, message: '请输入IP地址'}]}>
                                <Input placeholder="请输入IP地址"/>
                            </Form.Item>

                            <Form.Item label="子网掩码" name='netmask' rules={[{required: true, message: '请输入子网掩码'}]}>
                                <Input placeholder="请输入子网掩码"/>
                            </Form.Item>

                            <Form.Item label="网关" name='gateway' rules={[{required: true, message: '请输入网关'}]}>
                                <Input placeholder="请输入网关"/>
                            </Form.Item>
                        </>
                }
            </Form>
        </Modal>
    )
};

export default NetwordModal;
