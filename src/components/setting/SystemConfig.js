import React, {Component} from 'react';
import {
    Button,
    Form,
    Input,
    Layout,
    Select,
    Tabs,
    Divider,
    Table,
    Modal,
    Transfer, Typography, Switch,
    InputNumber, TimePicker, Spin
} from "antd";
import request from "../../common/request";
import {message} from "antd/es";
import moment from 'moment';

const {Content} = Layout;
const {Option} = Select;
const {TabPane} = Tabs;
const {Text} = Typography;

const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 8},
};

const formItemLayout2 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};

const formItemLayout3 = {
    labelCol: {span: 2},
    wrapperCol: {span: 8},
};

const formTailLayout = {
    wrapperCol:{ offset: 0, span:18 }
};

class SystemConfig extends Component {

    state = {
        properties: {},
        messageItems:[],
        messageTabLoading:false,
        mesUserGroupVisible:false,
        mesUserGroupConfirmLoading:false,
        mesUserVisible:false,
        mesUserConfirmLoading:false,
        mesUserGroup:[],
        selectedUserGroup:[],
        mesUser:[],
        selectedUser:[],
        auditLogProperties:{},
        localBackupProperties:{},
        capacityExamination:{},
        loading2:false,
        loadTest:false,
        loading3:false,
        testVisible:false
    }

    mailSettingFormRef = React.createRef();
    logTimeSettingFormRef = React.createRef();
    logSettingFormRef = React.createRef();
    webSettingFormRef = React.createRef();
    httpsSettingFormRef = React.createRef();
    auditBackupSettingFormRef = React.createRef();
    capacityExaminationFormRef = React.createRef();
    approvalFormRef = React.createRef();
    localBackupFormRef = React.createRef();


    componentDidMount() {
        this.getProperties();
        this.getLogProperties();
        this.loadMessageTableData();
        this.getWebProperties();
        this.getHttpsProperties();
        this.getAuditBackupProperties();
        this.getCapacityExaminationProperties();
        this.getLocalBackupProperties();
    }

    getProperties = async () => {

        let result = await request.get('/properties');
        if (result['code'] === 1) {
            let properties = result['data'];

            for (let key in properties) {
                if (!properties.hasOwnProperty(key)) {
                    continue;
                }
                if (properties[key] === '-') {
                    properties[key] = '';
                }
            }

            this.setState({
                properties: properties
            })

            if (this.mailSettingFormRef.current) {
                this.mailSettingFormRef.current.setFieldsValue(properties)
            }

            if (this.logTimeSettingFormRef.current) {
                this.logTimeSettingFormRef.current.setFieldsValue(properties)
            }

            if (this.approvalFormRef.current) {
                this.approvalFormRef.current.setFieldsValue(properties)
            }

        } else {
            message.error(result['message']);
        }
    }

    changeProperties = async (values) => {
        let result = await request.put('/properties', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    getLogProperties = async () => {
        let result = await request.get('/sys-logs-level');
        if (result['code'] === 1) {
            let logproperties = result['data'];
            this.setState({
                logproperties: logproperties
            })

            if (this.logSettingFormRef.current) {
                this.logSettingFormRef.current.setFieldsValue(logproperties)
            }
        } else {
            message.error(result['message']);
        }
    }

    getWebProperties = async () => {
        let result = await request.get('/webconfig');
        if (result['code'] === 1) {
            let webproperties = result['data'];
            this.setState({
                webproperties: webproperties
            })

            if (this.webSettingFormRef.current) {
                this.webSettingFormRef.current.setFieldsValue(webproperties)
            }
        } else {
            message.error(result['message']);
        }
    }
    getHttpsProperties = async () => {
        let result = await request.get('/httpsstatus');
        if (result['code'] === 1) {
            let httpproperties = result['data'];
            this.setState({
                httpproperties: httpproperties
            })

            if (this.httpsSettingFormRef.current) {
                this.httpsSettingFormRef.current.setFieldsValue(httpproperties)
            }
        } else {
            message.error(result['message']);
        }
    }

    getAuditBackupProperties = async () => {
        let result = await request.get('/audit-backup');
        if (result['code'] === 1) {
            let auditLogProperties = result['data'];
            if (auditLogProperties['enable_remote_automatic_backup'] === "true") {
                auditLogProperties['enable_remote_automatic_backup'] = true;
            } else {
                auditLogProperties['enable_remote_automatic_backup'] = false;
            }

            let auditLogProperties2 = {
                ...auditLogProperties,
                "remote_backup_interval":auditLogProperties['remote_backup_interval']? moment(auditLogProperties['remote_backup_interval'], 'HH:mm'):"",
            };
            this.setState({
                auditLogProperties: auditLogProperties2
            })

            if (this.auditBackupSettingFormRef.current) {
                this.auditBackupSettingFormRef.current.setFieldsValue(auditLogProperties2)
            }
        } else {
            message.error(result['message']);
        }
    }

    getLocalBackupProperties = async () => {
        let result = await request.get('/audit-backup');
        if (result['code'] === 1) {
            let auditLogProperties = result['data'];
            if (auditLogProperties['enable_local_automatic_backup'] === "true") {
                auditLogProperties['enable_local_automatic_backup'] = true;
            }else {
                auditLogProperties['enable_local_automatic_backup'] = false;
            }
            let auditLogProperties2 = {
                ...auditLogProperties,
                "local_backup_interval":auditLogProperties['local_backup_interval']? moment(auditLogProperties['local_backup_interval'], 'HH:mm'):"",
            };
            this.setState({
                localBackupProperties: auditLogProperties2
            })

            if (this.localBackupFormRef.current) {
                this.localBackupFormRef.current.setFieldsValue(auditLogProperties2)
            }
        } else {
            message.error(result['message']);
        }
    }

    getCapacityExaminationProperties = async () => {
        let result = await request.get('/capacity-examination');
        if (result['code'] === 1) {
            let capacityExamination = result['data'];
            if (capacityExamination['enable_capacity_examination'] === "true") {
                capacityExamination['enable_capacity_examination'] = true;
            } else {
                capacityExamination['enable_capacity_examination'] = false;
            }
            this.setState({
                capacityExamination: capacityExamination
            })

            if (this.capacityExaminationFormRef.current) {
                this.capacityExaminationFormRef.current.setFieldsValue(capacityExamination)
            }
        } else {
            message.error(result['message']);
        }
    }

    changeCapacityExaminationProperties = async (values) => {
        let result = await request.put('/capacity-examination', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }


    changeAuditBackupProperties = async (values) => {
        let value= {
            ...values,
            "remote_backup_interval":values['remote_backup_interval']? values['remote_backup_interval'].format("HH:mm"):"",
            };
        let result = await request.put('/audit-backup', value);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    changeLocalBackupProperties = async (values) => {
        let value= {
            ...values,
            "local_backup_interval":values['local_backup_interval']? values['local_backup_interval'].format("HH:mm"):"",
            }
        let result = await request.put('/audit-backup', value);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    changeLogProperties = async (values) => {
        let result = await request.put('/sys-logs-level', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }


    changeWebProperties = async (values) => {
        this.setState({
            loading2:true,
            tip2:`成功启动新项目:${values.ip}:${values.port}，请前往新地址`
        })
        let result = await request.post('/webconfig', values);
        if (result.code === 1) {
            this.setState({loading2:false})
            message.success(`成功启动新项目:${values.ip}:${values.port}`);
        } else {
            this.setState({loading2:false})
            message.error(result.message);
        }
    }
    changehttpsProperties = async (values) => {
        this.setState({
            loading3:true,
            tip3:`重启项目成功，请刷新页面`
        })
        let result = await request.post(`/httpsstatus/${values['https']}`);
        if (result.code === 1) {
            this.setState({loading3:false})
            message.success('重启项目成功，请刷新页面');
        } else {
            this.setState({loading3:false})
            message.error(result.message);
        }
    }

    async loadMessageTableData() {
        this.setState({
            messageTabLoading: true
        });

        let data = []
        try {
            let result = await request.get('/message');
            if (result['code'] === 1) {
                data = result['data'];
            } else {
                message.error(result['message']);
            }
        } catch (e) {

        } finally {
            const items = data.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                messageItems: items,
                messageTabLoading: false
            });
        }
    }

    //左侧
    getMesNoUserGroup = async () => {
        let result = await request.get(`/message/theme_without_userGroup`);
        if (result['code'] === 1) {
            result['data'] = result['data'] ?result['data'] :[]
            const items = result['data'].map(item =>{
                return {'key':item['id'],...item}
            })
            this.setState({mesUserGroup:items})
        } else {
            message.error(result['message']);
        }
    }

    getMesUserGroup = async (record) => {
        let result = await request.get(`/message/theme_with_userGroup?theme=${record.theme}`);
        if (result['code'] === 1) {
            result['data'] = result['data'] ?result['data'] :[]
            const items = result['data'].map(item =>{
                return {'key':item['id'],...item}
            })
            const selectedArr = items.map(item => item.key);
            this.setState({
                selectedUserGroup:selectedArr
            })
        } else {
            message.error(result['message']);
        }
    }

    handleUserGroupChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            selectedUserGroup: targetKeys,
            directionGroup:direction,
            moveKeysGroup:moveKeys
        })
    }

    //左侧
    getMesNoUser = async () => {
        let result = await request.get(`/message/theme_without_user`);
        if (result['code'] === 1) {
            result['data'] = result['data'] ?result['data'] :[]
            const items = result['data'].map(item =>{
                return {'key':item['id'],...item}
            })
            this.setState({mesUser:items})
        } else {
            message.error(result['message']);
        }
    }
    //右侧
    getMesUser = async (record) => {
        let result = await request.get(`/message/theme_with_user?theme=${record.theme}`);
        if (result['code'] === 1) {
            result['data'] = result['data'] ?result['data'] :[]
            const items = result['data'].map(item =>{
                return {'key':item['id'],...item}
            })
            const selectedArr = items.map(item => item.key);
            this.setState({
                selectedUser:selectedArr
            })
        } else {
            message.error(result['message']);
        }
    }

    handleUserChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            selectedUser: targetKeys,
            direction:direction,
            moveKeys:moveKeys
        })
    }

    sendTestMail = async () => {
        this.setState({ loadTest:true })
        let values = this.mailSettingFormRef.current.getFieldsValue()
        let result = await request.post('/sys-send-test-mail',values);
        if (result.code === 1) {
            message.success("测试邮件发送成功, 请查看邮箱内是否接收到测试邮件");
            this.setState({ loadTest:false })
        } else {
            message.error(result.message);
            this.setState({ loadTest:false })
        }
    }

    handleOnTabChange = () => {
        this.getProperties()
        this.getLogProperties()
        this.loadMessageTableData();
        this.getWebProperties()
        this.getHttpsProperties();
        this.getAuditBackupProperties();
        this.getCapacityExaminationProperties();
    }

    render() {

        const columns = [{
            title: '消息类型',
            dataIndex: 'theme',
            key: 'theme',
        }, {
            title: '接收人',
            dataIndex: 'recipients',
            key: 'recipients',
        },{
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={()=>{
                                    this.setState({
                                        mesUserGroupVisible:true,
                                        currentGroupData:record,
                                    })
                                    this.getMesNoUserGroup()
                                    this.getMesUserGroup(record)
                                }}>消息接收用户组</Button>

                        <Button type="link" size='small'
                                onClick={()=>{
                                    this.setState({
                                        mesUserVisible:true,
                                        currentData:record
                                    })
                                    this.getMesNoUser()
                                    this.getMesUser(record)
                                }}>消息接收用户</Button>
                    </div>
                )
            },
        }
        ];


        return (
            <>
                <Content className="site-layout-background page-content">

                    <Tabs tabPosition={'top'} type="card" onChange={this.handleOnTabChange} tabBarStyle={{width: '100%'}}>

                        <TabPane tab="审批配置" key="approval">
                            <Form ref={this.approvalFormRef}  name="approval" onFinish={this.changeProperties} layout="horizontal" labelAlign="left">
                                <Form.Item
                                {...formItemLayout}
                                label="审批超时时间"
                                name="approval-timeout"
                                rules={[{ required: true, message: '请输入审批超时时间' }]}
                                >
                                    <InputNumber style={{width:'100%'}} min={1} max={10000} addonAfter="秒" placeholder="请输入1-10000之间的整数"/>
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                                </Form>
                        </TabPane>
                        <TabPane tab="邮箱配置" key="mail">
                            <Spin tip='测试邮件发送中...' spinning={this.state.loadTest}>
                                <Form ref={this.mailSettingFormRef} name="mail" onFinish={this.changeProperties}
                                      layout="horizontal" labelAlign="left">

                                    <Form.Item
                                        {...formItemLayout}
                                        name="mail-host"
                                        label="邮件服务器地址"
                                        rules={[
                                            {
                                                required: false,
                                                message: '邮件服务器地址',
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder="请输入邮件服务器地址"/>
                                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout}
                                        name="mail-port"
                                        label="邮件服务器端口"
                                        rules={[
                                            {
                                                required: false,
                                                message: '邮件服务器地址',
                                                min: 1,
                                                max: 65535
                                            },
                                        ]}
                                    >
                                        <Input type='number' placeholder="请输入邮件服务器地址"/>
                                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout}
                                        name="mail-username"
                                        label="邮箱账号"
                                        rules={[
                                            {
                                                required: false,
                                                type: "email",
                                                message: '请输入正确的邮箱账号',
                                            },
                                        ]}
                                    >
                                        <Input type='email' placeholder="请输入邮箱账号"/>
                                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout}
                                        name="mail-password"
                                        label="邮箱密码"
                                        tooltip="通过第三方登录部分邮件服务器时，此处需输入授权码，而不是邮箱密码"
                                        rules={[
                                            {
                                                required: false,
                                                message: '邮箱密码',
                                            },
                                        ]}
                                    >
                                        <Input type='password' placeholder="请输入邮箱密码"/>
                                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout}
                                        name="mail-receiver"
                                        label="收件邮箱"
                                        rules={[
                                            {
                                                required: false,
                                                type: "email",
                                                message: '请输入正确的收件邮箱账号',
                                            },
                                        ]}
                                    >
                                        <Input type='email' placeholder="请输入收件邮箱账号"/>
                                    </Form.Item>

                                    <Form.Item {...formTailLayout}>
                                        <Button type="primary" onClick={()=>{this.setState({ testVisible:true })}}>
                                            更新
                                        </Button>
                                        <Modal visible={this.state.testVisible}
                                               closable={false}
                                               okText='我已发送'
                                               cancelText='取消'
                                               centered={true}
                                               cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                               onOk={() => {
                                                   this.mailSettingFormRef.current.submit()
                                               }}
                                               onCancel={() => {
                                                   this.setState({testVisible: false})
                                               }}
                                        >
                                            <p>在保存邮箱配置时，请确认您已发送并成功收到测试邮件，否则邮件服务可能无法正常使用</p>
                                        </Modal>
                                        <Button style={{ marginLeft:93,backgroundColor:'#EAECEE'}} onClick={this.sendTestMail}>
                                            发送测试邮件
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Spin>
                        </TabPane>
                        <TabPane tab="日志配置" key="log">
                            <Form ref={this.logTimeSettingFormRef} name="logTime" onFinish={this.changeProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout2}
                                    name="login-log-saved-limit"
                                    label="登录日志保留时长"
                                    initialValue=""
                                >
                                    <Select onChange={null}>
                                        <Option value="">永久</Option>
                                        <Option value="30">30天</Option>
                                        <Option value="60">60天</Option>
                                        <Option value="180">180天</Option>
                                        <Option value="360">360天</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout2}
                                    name="opera-log-saved-limit"
                                    label="操作日志保留时长"
                                    initialValue=""
                                >
                                    <Select onChange={null}>
                                        <Option value="">永久</Option>
                                        <Option value="30">30天</Option>
                                        <Option value="60">60天</Option>
                                        <Option value="180">180天</Option>
                                        <Option value="360">360天</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout2}
                                    name="approval-log-saved-limit"
                                    label="审批日志保留时长"
                                    initialValue=""
                                >
                                    <Select onChange={null}>
                                        <Option value="">永久</Option>
                                        <Option value="30">30天</Option>
                                        <Option value="60">60天</Option>
                                        <Option value="180">180天</Option>
                                        <Option value="360">360天</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout2}
                                    name="cron-log-saved-limit"
                                    label="计划任务日志保留时长"
                                    initialValue=""
                                >
                                    <Select onChange={null}>
                                        <Option value="">永久</Option>
                                        <Option value="30">30天</Option>
                                        <Option value="60">60天</Option>
                                        <Option value="180">180天</Option>
                                        <Option value="360">360天</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout2}
                                    name="encrypt-log-saved-limit"
                                    label="改密计划日志保存时长"
                                    initialValue=""
                                >
                                    <Select onChange={null}>
                                        <Option value="">永久</Option>
                                        <Option value="30">30天</Option>
                                        <Option value="60">60天</Option>
                                        <Option value="180">180天</Option>
                                        <Option value="360">360天</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Divider />
                            <Form ref={this.logSettingFormRef} name="log" onFinish={this.changeLogProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout2}
                                    name="sys-logs-level"
                                    label="系统日志级别"
                                    initialValue=""
                                >
                                    <Select onChange={null}>
                                        <Option value="Panic">Panic</Option>
                                        <Option value="Fatal">Fatal</Option>
                                        <Option value="Error">Error</Option>
                                        <Option value="Warn">Warn</Option>
                                        <Option value="Info">Info</Option>
                                        <Option value="Debug">Debug</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="审计备份配置" key="audit-log">
                            <Form ref={this.auditBackupSettingFormRef} name="audit-log" onFinish={this.changeAuditBackupProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="enable_remote_automatic_backup"
                                    label="启用远程自动备份"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked, event) => {
                                        this.setState({
                                            auditLogProperties: {
                                                ...this.state.auditLogProperties,
                                                'enable_remote_automatic_backup': checked,
                                            }
                                        })
                                    }}/>
                                </Form.Item>
                                {
                                    this.state.auditLogProperties['enable_remote_automatic_backup'] === true ?
                                    <>
                                    <Form.Item
                                            {...formItemLayout}
                                            name="remote_backup_interval"
                                            label="备份时间"
                                        >
                                    <TimePicker showNow={false} format='HH:mm' />
                                    </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="remote_backup_protocol"
                                            label="协议"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请选择协议',
                                                }
                                                    ]}
                                            initialValue=""
                                        >
                                            <Select onChange={null}>
                                                <Option value="ftp">FTP</Option>
                                                <Option value="sftp">SFTP</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="remote_backup_host"
                                            label="主机"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入主机地址',
                                                },
                                                {
                                                    pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                                    message: '请输入合法的主机地址'
                                                }
                                            ]}
                                        >
                                            <Input type='text' placeholder="请输入主机"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="remote_backup_port"
                                            label="端口"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入端口',
                                                },
                                            ]}
                                        >
                                            <Input type='number' placeholder="请输入端口"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="remote_backup_account"
                                            label="用户名"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入用户名',
                                                },
                                            ]}
                                        >
                                            <Input placeholder="请输入用户名"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="remote_backup_password"
                                            label="密码"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入密码',
                                                },
                                            ]}
                                        >
                                            <Input.Password placeholder="请输入密码"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="remote_backup_path"
                                            label="备份路径"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入路径',
                                                },
                                            ]}
                                        >
                                            <Input placeholder="请输入路径"/>
                                        </Form.Item>
                                    </> : null
                                }
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                                </Form>
                                <Divider />
                            <Form ref={this.localBackupFormRef} name="local-log" onFinish={this.changeLocalBackupProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="enable_local_automatic_backup"
                                    label="启用本地自动备份"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked, event) => {
                                        this.setState({
                                            localBackupProperties: {
                                                ...this.state.localBackupProperties,
                                                'enable_local_automatic_backup': checked,
                                            }
                                        })
                                    }}/>
                                </Form.Item>
                                {
                                    this.state.localBackupProperties['enable_local_automatic_backup'] === true ?
                                    <>
                                    <Form.Item
                                            {...formItemLayout}
                                            name="local_backup_interval"
                                            label="备份时间"
                                            initialValue=""
                                        >
                                    <TimePicker format='HH:mm' />
                                    </Form.Item>
                                    </> : null
                                }

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="站内消息配置" key="message">
                            <Table key='messageTable'
                                   dataSource={this.state.messageItems}
                                   columns={columns}
                                   position={'both'}
                                   loading={this.state.messageTabLoading}
                                   pagination={{
                                       hideOnSinglePage:true
                                   }}
                                   bordered
                                   size={'small'}
                            />

                            {
                                this.state.mesUserGroupVisible ?
                                    <Modal title={<Text>修改「<strong>{this.state.currentGroupData.theme}</strong>」接收用户组</Text>}
                                           visible={this.state.mesUserGroupVisible}
                                           confirmLoading={this.state.mesUserGroupConfirmLoading}

                                           onOk={async () => {
                                               this.setState({
                                                   mesUserGroupConfirmLoading: true
                                               });

                                               let mesUserGroupVisible = false;

                                               if(this.state.directionGroup === 'right'){
                                                   let result = await request.post(`/message/bind_userGroup?theme=${this.state.currentGroupData.theme}&id=${this.state.moveKeysGroup.join(',')}`);
                                                   if (result['code'] === 1) {
                                                       message.success('操作成功');
                                                       this.loadMessageTableData();
                                                   } else {
                                                       message.error(result['message'], 10);
                                                       mesUserGroupVisible = true;
                                                   }
                                               }

                                               if(this.state.directionGroup === 'left'){
                                                   let result = await request.post(`/message/unbind_userGroup?theme=${this.state.currentGroupData.theme}&id=${this.state.moveKeysGroup.join(',')}`);
                                                   if (result['code'] === 1) {
                                                       message.success('操作成功');
                                                       this.loadMessageTableData();
                                                   } else {
                                                       message.error(result['message'], 10);
                                                       mesUserGroupVisible = true;
                                                   }
                                               }

                                               this.setState({
                                                   mesUserGroupConfirmLoading: false,
                                                   mesUserGroupVisible: mesUserGroupVisible
                                               })
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   mesUserGroupVisible: false
                                               })
                                           }}
                                           centered={true}
                                           cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                    >
                                        <Transfer
                                            dataSource={this.state.mesUserGroup}
                                            showSearch
                                            titles={['可选择的用户组', '已选择的用户组']}
                                            listStyle={{
                                                width: 250,
                                                height: 300,
                                            }}
                                            targetKeys={this.state.selectedUserGroup}
                                            onChange={this.handleUserGroupChange}
                                            render={item => `${item.name}`}
                                        />
                                    </Modal> : undefined
                            }

                            {
                                this.state.mesUserVisible ?
                                    <Modal title={<Text>修改「<strong>{this.state.currentData.theme}</strong>」接收用户</Text>}
                                           visible={this.state.mesUserVisible}
                                           confirmLoading={this.state.mesUserConfirmLoading}
                                           onOk={async () => {
                                               this.setState({
                                                   mesUserConfirmLoading: true
                                               });

                                               let mesUserVisible = false;

                                               if(this.state.direction === 'right'){
                                                   let result = await request.post(`/message/bind_user?theme=${this.state.currentData.theme}&id=${this.state.moveKeys.join(',')}`);
                                                   if (result['code'] === 1) {
                                                       message.success('操作成功');
                                                       this.loadMessageTableData();
                                                   } else {
                                                       message.error(result['message'], 10);
                                                       mesUserVisible = true;
                                                   }

                                               }

                                               if(this.state.direction === 'left'){
                                                   let result = await request.post(`/message/unbind_user?theme=${this.state.currentData.theme}&id=${this.state.moveKeys.join(',')}`);
                                                   if (result['code'] === 1) {
                                                       message.success('操作成功');
                                                       this.loadMessageTableData();
                                                   } else {
                                                       message.error(result['message'], 10);
                                                       mesUserVisible = true;
                                                   }
                                               }

                                               this.setState({
                                                   mesUserConfirmLoading: false,
                                                   mesUserVisible: mesUserVisible
                                               })
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   mesUserVisible: false
                                               })
                                           }}
                                           centered={true}
                                           cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                    >
                                        <Transfer
                                            dataSource={this.state.mesUser}
                                            showSearch
                                            titles={['可选择的用户', '已选择的用户']}
                                            listStyle={{
                                                width: 250,
                                                height: 300,
                                            }}
                                            targetKeys={this.state.selectedUser}
                                            onChange={this.handleUserChange}
                                            render={item => `${item.username}`}
                                        />
                                    </Modal> : undefined
                            }

                        </TabPane>
                        <TabPane tab="web配置" key="web">
                            <Spin tip={this.state.tip3} spinning={this.state.loading3}>
                            <Form ref={this.httpsSettingFormRef} name="web" onFinish={this.changehttpsProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout3}
                                    name="https"
                                    label="启用https"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                            </Form>
                            </Spin>
                            <Divider />
                            <Spin tip={this.state.tip2} spinning={this.state.loading2}>
                                <Form ref={this.webSettingFormRef} name="web" onFinish={this.changeWebProperties}
                                      layout="horizontal" labelAlign="left">
                                    <Form.Item
                                        {...formItemLayout3}
                                        name="ip"
                                        label="IP"
                                        rules={[
                                            {
                                                required: false,
                                                message: '请输入ip地址',
                                            },
                                            {
                                                pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                                message: '请输入合法的ip地址'
                                            }
                                        ]}
                                    >
                                        <Input type='text' placeholder="请输入合法的ip地址"/>
                                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout3}
                                        name="port"
                                        label="端口"
                                        rules={[
                                            {
                                                required: false,
                                            },
                                        ]}
                                    >
                                        <Input type='number' placeholder="请输入端口"/>
                                    </Form.Item>


                                    <Form.Item {...formTailLayout}>
                                        <Button type="primary" htmlType="submit">
                                            更新
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Spin>
                        </TabPane>
                        <TabPane tab="存储配置" key="storage">
                        <Form ref={this.capacityExaminationFormRef} name="storage" onFinish={this.changeCapacityExaminationProperties}
                              layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="enable_capacity_examination"
                                    label="启用"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked, event) => {
                                        this.setState({
                                            capacityExamination: {
                                                ...this.state.capacityExamination,
                                                'enable_capacity_examination': checked,
                                            }
                                        })
                                    }}/>
                                </Form.Item>
                                {
                                    this.state.capacityExamination['enable_capacity_examination'] === true ?
                                    <>
                                       <Form.Item
                                            {...formItemLayout}
                                            name="disk_size"
                                            label="存储百分比"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入存储百分比',
                                                }
                                            ]}
                                            >
                                                 <Select onChange={null}>
                                                <Select.Option value="1">1%</Select.Option>
                                                <Select.Option value="10">10%</Select.Option>
                                                <Select.Option value="20">20%</Select.Option>
                                                <Select.Option value="50">50%</Select.Option>
                                                <Select.Option value="60">60%</Select.Option>
                                                <Select.Option value="70">70%</Select.Option>
                                                <Select.Option value="80">80%</Select.Option>
                                                <Select.Option value="90">90%</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            name="delete_log_size"
                                            label="日志条数限制"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入日志条数限制',
                                                }
                                            ]}
                                        >
                                            <InputNumber style={{width:'100%'}} min={1} max={1000} addonAfter="万条" placeholder="请输入"  />
                                        </Form.Item>
                                    </> : undefined
                                }
                                 <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                                    </Form>
                        </TabPane>
                    </Tabs>
                </Content>
            </>
        );
    }
}

export default SystemConfig;
