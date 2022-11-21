import React, {Component} from 'react';
import {Button, Card, Form, Image, Input, Layout, Modal, Result, Space, Switch, Spin, Typography} from "antd";
import request from "../../common/request";
import {message} from "antd/es";
import {ExclamationCircleOutlined, ReloadOutlined} from "@ant-design/icons";

const {Content} = Layout;
const {Meta} = Card;
const {Text} = Typography;

const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 6},
};
const formTailLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 6, offset: 3},
};
const {confirm} = Modal;

class Info extends Component {

    state = {
        user: {
            enableTotp: false
        },
        properties: {},
        mailVisible:false,
        updateVisible:false
    }

    passwordFormRef = React.createRef();
    mailFormRef = React.createRef();

    componentDidMount() {
        this.loadInfo();
        this.mailVerify()
    }

    loadInfo = async () => {
        let result = await request.get('/info');
        if (result['code'] === 1) {
            this.setState({
                user: result['data']
            })
            sessionStorage.setItem('user', JSON.stringify(result['data']));
        } else {
            message.error(result['message']);
        }
    }

    onNewPasswordChange(value) {
        this.setState({
            'newPassword': value.target.value
        })
    }

    onNewPassword2Change = (value) => {
        this.setState({
            ...this.validateNewPassword(value.target.value),
            'newPassword2': value.target.value
        })
    }

    validateNewPassword = (newPassword2) => {
        if (newPassword2 === this.state.newPassword) {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
        return {
            validateStatus: 'error',
            errorMsg: '两次输入的密码不一致',
        };
    }

    changePassword = async (values) => {
        let result = await request.post('/change-password', values);
        if (result.code === 1) {
            message.success('密码修改成功，即将跳转至登录页面');
            window.location.href = '/#';
        } else {
            message.error(result.message);
        }
    }

    confirmTOTP = async (values) => {
        values['secret'] = this.state.secret
        let result = await request.post('/confirm-totp', values);
        if (result.code === 1) {
            message.success('TOTP启用成功');
            await this.loadInfo();
            this.setState({
                qr: "",
                secret: ""
            })
        } else {
            message.error(result.message);
        }
    }

    resetTOTP = async () => {
        let result = await request.get('/reload-totp');
        if (result.code === 1) {
            this.setState({
                qr: result.data.qr,
                secret: result.data.secret,
            })
        } else {
            message.error(result.message);
        }
    }

    onChange(checked) {
        console.log(`switch to ${checked}`);
    }

    sendMail = async () => {
        //获取input框的值（getFieldValue获取对应字段名的值)
        this.setState({ mailVisible:true })
        let mail= this.mailFormRef.current.getFieldValue('mail')
        let params = {
            'mail': mail
        };
        let result = await request.post('/send-test-mail', params);
        if (result.code === 1) {
            this.setState({ mailVisible: false })
            message.success("测试邮件发送成功, 请先查看邮箱内是否接收到测试邮件, 确认收到后再开启邮箱验证功能");
        } else {
            this.setState({ mailVisible: false })
            message.error(result.message);
        }
    }

    showModal = () =>{
        this.setState({ updateVisible:true })
    }

    sendMailVerify = async (values) => {
        let result = await request.post('/set-mail-verify', values);
        if (result.code === 1) {
            message.success('更新成功');
        } else {
            message.error(result.message);
        }
    }

    mailVerify = async () => {
        let result = await request.get('/mail-verify');
        if (result['code'] === 1) {
            let properties = result['data'];
            for (let key in properties) {
                if (properties[key] === '-') {
                    properties[key] = '';
                }
            }
            this.setState({
                properties: properties
            })
            this.mailFormRef.current.setFieldsValue(properties)
        } else {
            message.error(result['message']);
        }
    }

    render() {
        return (
            <>
                <Card title={<Text italic style={{fontSize:20,color:'#666',fontWeight: 600}}>个人中心</Text>}
                      bodyStyle={{display:'none'}} >
                </Card>
                <Content className="site-layout-background page-content">
                    <Text style={{fontSize:16,color:'#666',fontWeight: 600}}>修改密码</Text>
                    <Form ref={this.passwordFormRef} name="password" onFinish={this.changePassword} style={{marginTop:15}}>
                        <Form.Item
                            {...formItemLayout}
                            name="oldPassword"
                            label="原始密码"
                            rules={[
                                {
                                    required: true,
                                    message: '原始密码',
                                },
                            ]}
                        >
                            <Input type='password' placeholder="请输入原始密码"/>
                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            name="newPassword"
                            label="新的密码"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入新的密码',
                                },
                            ]}
                        >
                            <Input type='password' placeholder="新的密码"
                                   onChange={(value) => this.onNewPasswordChange(value)}/>
                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            name="newPassword2"
                            label="确认密码"
                            rules={[
                                {
                                    required: true,
                                    message: '请和上面输入新的密码保持一致',
                                },
                            ]}
                            validateStatus={this.state.validateStatus}
                            help={this.state.errorMsg || ''}
                        >
                            <Input type='password' placeholder="请和上面输入新的密码保持一致"
                                   onChange={(value) => this.onNewPassword2Change(value)}/>
                        </Form.Item>
                        <Form.Item {...formTailLayout}>
                            <Button type="primary" htmlType="submit">
                                提交
                            </Button>
                        </Form.Item>
                    </Form>
                </Content>
                <Content className="site-layout-background page-content">
                    <Text style={{fontSize:16,color:'#666',fontWeight: 600}}>双因素认证</Text>
                    <Form hidden={this.state.qr} style={{marginTop:15}}>
                        <Form.Item>
                            {
                                this.state.user.enableTotp ?
                                    <Result
                                        status="success"
                                        title="您已成功开启双因素认证!"
                                        subTitle="多因素认证-MFA二次认证-登录身份鉴别,访问控制更安全。"
                                        extra={[
                                            <Button type="primary" key="console" danger onClick={() => {
                                                confirm({
                                                    title: '您确认要解除双因素认证吗？',
                                                    icon: <ExclamationCircleOutlined/>,
                                                    content: '解除之后可能存在系统账号被暴力破解的风险。',
                                                    okText: '确认',
                                                    okType: 'danger',
                                                    cancelText: '取消',
                                                    onOk: async () => {
                                                        let result = await request.post('/reset-totp');
                                                        if (result.code === 1) {
                                                            message.success('双因素认证解除成功');
                                                            await this.loadInfo();
                                                        } else {
                                                            message.error(result.message);
                                                        }
                                                    },
                                                    onCancel() {
                                                        console.log('Cancel');
                                                    },
                                                })
                                            }}>
                                                解除绑定
                                            </Button>,
                                            <Button key="re-bind" onClick={this.resetTOTP}>重新绑定</Button>,
                                        ]}
                                    /> :
                                    <Result
                                        status="warning"
                                        title="您还未开启双因素认证！"
                                        subTitle="系统账号存在被暴力破解的风险。"
                                        extra={
                                            <Button type="primary" key="bind" onClick={this.resetTOTP}>
                                                去开启
                                            </Button>
                                        }
                                    />
                            }

                        </Form.Item>
                    </Form>
                    <Form hidden={!this.state.qr} onFinish={this.confirmTOTP} style={{marginTop:15}}>
                        <Form.Item {...formItemLayout} label="二维码">
                            <Space size={12}>

                                <Card
                                    hoverable
                                    style={{width: 280}}
                                    cover={<Image
                                        style={{margin: 40, marginBottom: 20}}
                                        width={200}
                                        src={"data:image/png;base64, " + this.state.qr}
                                    />
                                    }
                                >
                                    <Meta title="双因素认证二维码"
                                          description="有效期30秒，在扫描后请尽快输入。推荐使用Google Authenticator, Authy 或者 Microsoft Authenticator。"/>
                                </Card>

                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined/>}
                                    onClick={this.resetTOTP}
                                >
                                    重新加载
                                </Button>
                            </Space>
                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            name="totp"
                            label="TOTP"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入双因素认证APP中显示的授权码',
                                },
                            ]}
                        >
                            <Input placeholder="请输入双因素认证APP中显示的授权码"/>
                        </Form.Item>
                        <Form.Item {...formTailLayout}>
                            <Button type="primary" htmlType="submit">
                                确认
                            </Button>
                        </Form.Item>
                    </Form>
                </Content>
                <Content className="site-layout-background page-content">
                    <Text style={{fontSize:16,color:'#666',fontWeight: 600}}>邮箱认证</Text>
                    <Form ref={this.mailFormRef} onFinish={this.sendMailVerify} style={{marginTop:15}}>
                        <Form.Item label="接受验证码邮箱" labelCol={{ span: 3}} wrapperCol={{ span: 15 }}>
                            <Form.Item
                                name="mail"
                                rules={[
                                   {   required: true,
                                       message: '请输入接受验证码邮箱'
                                   },
                                   {
                                       type: 'email',
                                       message: '无效邮箱，请重新输入!',
                                   }]}
                                noStyle
                            >
                                <Input placeholder="请输入接受验证码邮箱" style={{ width: '40%' }}/>
                            </Form.Item>
                            <Button style={{ marginLeft:'10px',backgroundColor:'#EAECEE'}} onClick={this.sendMail}>
                                发送测试邮件
                            </Button>
                            <Modal visible={this.state.mailVisible} footer={null} closable={false}>
                                <p>测试邮件发送中 <Spin /></p>
                            </Modal>
                        </Form.Item>
                        <Form.Item
                            label="启用邮箱认证"
                            labelCol={{ span: 3}} wrapperCol={{ span: 15 }}
                            name='state'
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                        </Form.Item>
                        <Form.Item {...formTailLayout}>
                            <Button type="primary" onClick={this.showModal}>
                                更新
                            </Button>
                            <Modal
                                visible={this.state.updateVisible}
                                closable={false}
                                okText={'我已发送'}
                                onOk={() => {
                                    this.mailFormRef.current.submit()
                                }}
                                onCancel={() => {
                                    this.setState({updateVisible: false})
                                }}
                            >
                                <p>开启邮箱认证后，登录时需要输入邮箱验证码才能登录系统 </p>
                                <p>在开启前，请确认您已发送并成功收到测试邮件</p>
                            </Modal>
                        </Form.Item>
                    </Form>
                </Content>
            </>
        );
    }
}

export default Info;
