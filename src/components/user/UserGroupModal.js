import React from 'react';
import {Form, Input, Modal, Select} from "antd/lib/index";
import { Tree } from 'antd';


const UserGroupModal = ({
                            title,
                            visible,
                            handleOk,
                            handleCancel,
                            confirmLoading,
                            model,
                            users,
                            change,
                            treeData,
                            onCheck,
                            checkedNodes
                        }) => {

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    return (
        <Modal
            title={title}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
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

                <Form.Item label="名称" name='name' rules={[{required: true, message: '请输入用户组名称'}]}>
                    <Input autoComplete="off" placeholder="请输入用户组名称"/>
                </Form.Item>

                <Form.Item label="用户组成员" name='members'>
                    <Select
                        // showSearch
                        mode="multiple"
                        allowClear
                        placeholder='用户组成员'
                        filterOption={false}
                    >
                        {users.map(d => <Select.Option key={d.id}
                                                       value={d.id}>{d.nickname}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item label="菜单权限">
                    <Tree
                        checkable
                        disabled={change}
                        treeData={treeData}
                        onCheck={onCheck}
                        checkedKeys={checkedNodes}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default UserGroupModal;
