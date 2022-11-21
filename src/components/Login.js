import React, {Component} from 'react';
import {Button, Form, Input, Modal} from "antd";
import './Login.css'
import request from "../common/request";
import {message} from "antd/es";
import {withRouter} from "react-router-dom";
import {OneToOneOutlined} from '@ant-design/icons';
import logo from "./login_logo.png"
import chn from "./chn.png"
import key from "./key.png"
import refresh from "./refresh.png"

class LoginForm extends Component {

    formRef = React.createRef();
    totpInputRef = React.createRef();
    formMailRef = React.createRef();
    mailInputRef = React.createRef();

    state = {
        inLogin: false,
        height: window.innerHeight,
        width: window.innerWidth,
        loginAccount: undefined,
        totpModalVisible: false,
        confirmLoading: false,
        mailModalVisible: false,
        mailConfirmLoading: false,
        captchaId:'',
        imageUrl:'',
    };

    componentDidMount() {
        window.addEventListener('resize', () => {
            this.setState({
                height: window.innerHeight,
                width: window.innerWidth
            })
        });
        this.getCaptcha()
    }

    async getCaptcha() {
        let result = await request.get('/getCaptcha');
        if (result['code'] === 1) {
            this.setState({
                captchaId: result['data'].captchaId,
                imageUrl: result['data'].imageUrl
            })
        } else {
            message.error(result['message']);
        }
    }
    async imageClick() {
        this.setState({
            imageUrl:this.state.imageUrl+'&reload=true'
        })
    }

    handleSubmit = async params => {
        this.setState({
            inLogin: true
        });
        let result = await request.get(`/verifyCaptcha?captchaId=${this.state.captchaId}&value=${params['code']}`);
        if (result['code'] === 1) {
            let accountParam={
                username: params['username'],
                password: params['password'],
                remember: params['remember']
            }
            try {
                let result = await request.post('/login', accountParam);
                if (result.code === 0) {
                    // 进行双因子认证
                    this.setState({
                        loginAccount: accountParam,
                        totpModalVisible: true
                    })

                    this.totpInputRef.current.focus();
                    return;
                }
                if (result.code === 2) {
                    // 进行邮箱认证
                    this.setState({
                        loginAccount: accountParam,
                        mailModalVisible: true,
                        verifyMailId: result['data'],
                        message: result['message']
                    })
                    this.mailInputRef.current.focus();
                    return;
                }
                if(result.code===3){
                    Modal.warning({
                        title: '密码过期警告',
                        content: result.message,
                        afterClose:function () {
                            sessionStorage.removeItem('current');
                            sessionStorage.removeItem('openKeys');
                            localStorage.setItem('X-Auth-Token', result['data']);
                            window.location.href = "/"
                        }
                    });
                    return;
                }
                else if (result.code !== 1) {
                    throw new Error(result.message);
                }

                // 跳转登录
                sessionStorage.removeItem('current');
                sessionStorage.removeItem('openKeys');
                localStorage.setItem('X-Auth-Token', result['data']);
                // this.props.history.push();
                window.location.href = "/"
            } catch (e) {
                message.error(e.message);
            } finally {
                this.setState({
                    inLogin: false
                });
            }

        } else {
            message.error(result['message']);
            this.setState({
                inLogin: false
            });
            this.getCaptcha()
        }
    };

    handleOk = async (values) => {
        this.setState({
            confirmLoading: true
        })
        let loginAccount = this.state.loginAccount;
        loginAccount['totp'] = values['totp'];
        try {
            let result = await request.post('/loginWithTotp', loginAccount);

            if (result.code === 2) {
                // 进行邮箱认证
                this.setState({
                    loginAccount: loginAccount,
                    mailModalVisible: true,
                    verifyMailId: result['data'],
                    message: result['message']
                })
                this.mailInputRef.current.focus();
                return;
            }

            if (result['code'] !== 1) {
                message.error(result['message']);
                return;
            }

            // 跳转登录
            sessionStorage.removeItem('current');
            sessionStorage.removeItem('openKeys');
            localStorage.setItem('X-Auth-Token', result['data']);
            // this.props.history.push();
            window.location.href = "/"
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({
                confirmLoading: false
            });
        }
    }

    handleCancel = () => {
        this.setState({
            totpModalVisible: false
        })
    }

    handleMailOk = async (values) => {
        this.setState({
            mailConfirmLoading: true
        })
        let loginAccount = this.state.loginAccount;
        loginAccount['verifyMailCode'] = values['verifyMailCode'];
        loginAccount['verifyMailId'] = this.state.verifyMailId;
        try {
            let result = await request.post('/loginWithMail', loginAccount);

            if (result['code'] !== 1) {
                message.error(result['message']);
                setTimeout(function () {
                    window.location.href = "/"
                }, 2000);
                return;
            }

            // 跳转登录
            sessionStorage.removeItem('current');
            sessionStorage.removeItem('openKeys');
            localStorage.setItem('X-Auth-Token', result['data']);
            // this.props.history.push();
            window.location.href = "/"
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({
                mailConfirmLoading: false
            });
        }
    }

    handleMailCancel = () => {
        this.setState({
            mailModalVisible: false
        })
    }

    render() {
        return (
            <div className='login-bg'
                 style={{width: this.state.width, height: this.state.height}}>
                <div className='login-weaper'>
                    <div className="login-left">
                        <img src={logo} alt="" className="img"/>
                    </div>
                    <div className='login-border'>
                        <div className="login-main">
                            <div className='login-title'>
                                <span>运维安全管理系统</span>
                                <span><img src={chn} alt=""/>CHN</span>
                            </div>
                            <Form onFinish={this.handleSubmit} className="login-form">
                                <Form.Item name='username' rules={[{required: true, message: '请输入用户名称！'}]}>
                                    <Input className="username" placeholder="请输入用户名称" />
                                </Form.Item>
                                <Form.Item name='password' rules={[{required: true, message: '请输入登录密码！'}]}>
                                    <Input.Password className="password" placeholder="请输入登录密码"/>
                                </Form.Item>
                                <Form.Item>
                                    <div className="key">
                                        <div className="key-img"><img src={key} alt=""/></div>
                                        <Form.Item name="code" rules={[{required: true, message: '请输入验证码！'}]} className="code-left">
                                            <Input className="code" placeholder="请输入验证码" />
                                        </Form.Item>
                                    </div>
                                    <div className="login-code">
                                        <img className="code-img" src={this.state.imageUrl} alt="验证码"  />
                                        <span><img src={refresh} alt="" onClick={() => this.imageClick()} />换一组</span>
                                    </div>
                                </Form.Item>
                                {/*<Form.Item name='remember' valuePropName='checked' initialValue={false}>*/}
                                {/*    <Checkbox>记住登录</Checkbox>*/}
                                {/*</Form.Item>*/}
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className="login-form-button"
                                            loading={this.state.inLogin}>
                                        登录
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </div>
                </div>
                <Modal title="双因素认证" visible={this.state.totpModalVisible} confirmLoading={this.state.confirmLoading}
                       maskClosable={false}

                       okButtonProps={{form:'totp-form', key: 'submit', htmlType: 'submit'}}
                       onOk={() => {
                           this.formRef.current
                               .validateFields()
                               .then(values => {
                                   this.handleOk(values);
                                   // this.formRef.current.resetFields();
                               })
                               .catch(info => {

                               });
                       }}
                       onCancel={this.handleCancel}>

                    <Form id='totp-form' ref={this.formRef}>

                        <Form.Item name='totp' rules={[{required: true, message: '请输入双因素认证APP中显示的授权码'}]}>
                            <Input ref={this.totpInputRef} prefix={<OneToOneOutlined/>} placeholder="请输入双因素认证APP中显示的授权码"/>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal title="邮箱认证" visible={this.state.mailModalVisible} confirmLoading={this.state.mailConfirmLoading}
                       maskClosable={false}

                       okButtonProps={{form:'mail-form', key: 'submit', htmlType: 'submit'}}
                       onOk={() => {
                           this.formMailRef.current
                               .validateFields()
                               .then(values => {
                                   this.handleMailOk(values);
                                   // this.formMailRef.current.resetFields();
                               })
                               .catch(info => {

                               });
                       }}
                       onCancel={this.handleMailCancel}>

                    <Form id='mail-form' ref={this.formMailRef}>
                        <p>{this.state.message}</p>
                        <Form.Item name='verifyMailCode' rules={[{required: true, message: '请输入邮件显示的验证码码'}]}>
                            <Input ref={this.mailInputRef} prefix={<OneToOneOutlined/>} placeholder="请输入邮件显示的验证码码"/>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>

        );
    }
}

export default withRouter(LoginForm);
