import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import {Select, Button} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './UserModal.css'

const UserModal = ({title, visible, handleOk, handleCancel, confirmLoading, model, userGroups,
                       ulList, divList, handClickCell, handelAllow, handelForbid, handelWorkday, limitBoxDisabled}) => {

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 4},
        wrapperCol: {span: 20},
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
                        // form.resetFields();
                        handleOk(values);
                    })
                    .catch(info => {
                    });
            }}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
            width={700}
            centered={true}
            cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
        >

            <Form form={form} {...formItemLayout} initialValues={model} size='small'>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label="登录账户" name='username' rules={[{required: true, message: '请输入登录账户'}]}>
                    <Input autoComplete="off" placeholder="请输入登录账户" disabled={model.username==='admin'}/>
                </Form.Item>

                <Form.Item label="用户昵称" name='nickname' rules={[{required: true, message: '请输入用户昵称'}]}>
                    <Input placeholder="请输入用户昵称"/>
                </Form.Item>

                <Form.Item label="用户组" name='type' rules={[{required: true, message: '请选择用户角色'}]}>
                    <Select disabled={model.username==='admin'}>
                        {userGroups.map(item => {
                            return (<Select.Option key={item.id} value={item.name}>{item.name}</Select.Option>)
                        })}
                    </Select>
                </Form.Item>

                <Form.Item label="邮箱账号" name="mail" rules={[{required: false, type: "email", message: '请输入正确的邮箱账号',},]}>
                    <Input type='email' placeholder="请输入邮箱账号"/>
                </Form.Item>

                {
                    title.indexOf('新增') > -1 ?
                        (<Form.Item label="登录密码" name='password' rules={[{required: true, message: '请输入登录密码'}]}>
                            <Input.Password autoComplete="new-password" placeholder="输入登录密码"/>
                        </Form.Item>) : null
                }
                <Form.Item label="登录时间限制">
                    <div className={["limitBox", limitBoxDisabled ? "disableClass" : null].join(' ')}>
                        <div className="header">
                            <span onClick={handelAllow}><Button type="text" icon={<CheckCircleOutlined />}>全部允许</Button></span>
                            <span onClick={handelForbid}><Button type="text" icon={<CloseCircleOutlined />}>全部禁止</Button></span>
                            <span onClick={handelWorkday}><Button type="text" icon={<ClockCircleOutlined />}>工作日</Button></span>
                        </div>
                        <div className="limitBox-center">
                            <div className="limitBox-left">
                                <ul className="day">
                                    <li>周一</li>
                                    <li>周二</li>
                                    <li>周三</li>
                                    <li>周四</li>
                                    <li>周五</li>
                                    <li>周六</li>
                                    <li>周日</li>
                                </ul>
                            </div>
                            <div className="limitBox-right">
                                <div>
                                    <ul className="hour" id="hour">
                                        {
                                            ulList.map((item,index)=>{
                                                return <li key={index}>{item}</li>
                                            })
                                        }
                                    </ul>
                                </div>
                                <div>
                                    {
                                        divList.map((item,index)=>{
                                            return (
                                                <div className={["cell", item.checked ? "color" : null].join(' ')}
                                                     key={index} onClick={()=>handClickCell(item,index)}>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="footer">
                            <span/>
                            <span>允许</span>
                            <span/>
                            <span>禁止</span>
                        </div>
                    </div>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default UserModal;
