import React, {Component} from 'react';
import {Button, Form, Input, Layout, Select, Switch, Tabs, Divider} from "antd";
import {Option} from "antd/es/mentions";
import request from "../../common/request";
import {message} from "antd/es";


const {Content} = Layout;
const {TabPane} = Tabs;

const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 8},
};
const formTailLayout = {
    wrapperCol:{ offset: 0, span:18 }
};

class Authentication extends Component {

    state = {
        adproperties: {},
        ldapproperties:{},
        ldap: false,
        ad: false,
        orderModalVisible:false,
        current:[]
    }

    radiusSettingFormRef = React.createRef();
    ldapSettingFormRef = React.createRef();
    adSettingFormRef = React.createRef();
    componentDidMount() {
        // eslint-disable-next-line no-extend-native
        String.prototype.bool = function () {
            return (/^true$/i).test(this);
        };
        this.getRadiusProperties();
        this.getLdapProperties();
        this.getAdProperties();
    }

    getRadiusProperties = async () => {
        let result = await request.get('/authen/radius');
        if (result['code'] === 1) {
            let radiusproperties = result['data'];
            for (let key in radiusproperties) {
                if (key.startsWith('radius_auth')){
                    radiusproperties[key] = radiusproperties[key].bool();
                }
            }
            this.setState({
                radiusproperties: radiusproperties
            })

            if (this.radiusSettingFormRef.current) {
                this.radiusSettingFormRef.current.setFieldsValue(radiusproperties)
            }
        } else {
            message.error(result['message']);
        }
    }
    getLdapProperties = async () => {
        let result = await request.get('/authen/ldap');
        if (result['code'] === 1) {
            let ldapproperties = result['data'];

            for (let key in ldapproperties) {
                if (key.startsWith('LDAP_auth') || key.startsWith("LDAP_ssl") || key.startsWith("LDAP_synauth")) {
                    ldapproperties[key] = ldapproperties[key].bool();
                }
            }
            this.setState({
                ldapproperties: ldapproperties
            })
            if (this.ldapSettingFormRef.current) {
                this.ldapSettingFormRef.current.setFieldsValue(ldapproperties)
            }
        } else {
            message.error(result['message']);
        }
    }
    getAdProperties = async () => {
        let result = await request.get('/authen/ad');
        if (result['code'] === 1) {
            let adproperties = result['data'];

            for (let key in adproperties) {
                if (key.startsWith('AD_auth') || key.startsWith("AD_synauth")|| key.startsWith("AD_ssl")) {
                    adproperties[key] = adproperties[key].bool();
                }
            }
            this.setState({
                adproperties: adproperties
            })
            if (this.adSettingFormRef.current) {
                this.adSettingFormRef.current.setFieldsValue(adproperties)
            }
        } else {
            message.error(result['message']);
        }
    }

    changeRadiusProperties = async (values) => {
        let result = await request.post('/authen/radius', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }
    changeLdapProperties = async (values) => {
        let result = await request.post('/authen/ldap', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    changeAdProperties = async (values) => {
        let result = await request.post('/authen/ad', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    ldaptestProperties= async () => {
        this.ldapSettingFormRef.current
            .validateFields()
            .then(async (values) => {
                this.setState({ loading : true })
                let result = await request.post('/authen/ldaptestconn',values);
                if (result.code === 1) {
                    message.success('连接成功');
                } else {
                    message.error(result.message);
                }
            })


    }
    adtestProperties= async () => {
        this.adSettingFormRef.current
            .validateFields()
            .then(async (values) => {
                this.setState({ loading : true })
                let result = await request.put('/authen/adtestconn',values);
                if (result.code === 1) {
                    message.success('连接成功');
                } else {
                    message.error(result.message);
                }
            })


    }

    handleOnTabChange = () => {
        this.getRadiusProperties();
        this.getLdapProperties();
        this.getAdProperties();
    }

    render() {

        return (
            <>
                <Content className="site-layout-background page-content">
                    <Tabs tabPosition={'top'} type="card" onChange={this.handleOnTabChange} tabBarStyle={{width: '100%'}}>
                        <TabPane tab="RADIUS认证配置" key="radius">
                            <Form ref={this.radiusSettingFormRef} name="radius" onFinish={this.changeRadiusProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_auth"
                                    label="启用RADIUS"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_server"
                                    label="服务器地址"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                        {
                                            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                            message: '请输入合法的ip地址'
                                        }
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_port"
                                    label="端口"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='number' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_agreement"
                                    label="认证协议"
                                    initialValue=""
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Select onChange={null}>
                                        <Option value="pap">pap</Option>
                                        <Option value="chap">chap</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_secret"
                                    label="认证秘钥"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="输入认证秘钥"/>
                                </Form.Item>

                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="LDAP认证配置" key="ldap">
                            <Form ref={this.ldapSettingFormRef} name="ldap" onFinish={this.changeLdapProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_auth"
                                    label="启用LDAP"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_server"
                                    label="服务器地址"
                                    rules={[
                                        {
                                            required: true,
                                        },

                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_port"
                                    label="端口"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='number' />
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_dn"
                                    label="管理员DN"
                                    initialValue=""
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_password"
                                    label="密码"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="输入密码"/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_ou"
                                    label="用户ou"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_rule"
                                    label="过滤规则"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_usernameatt"
                                    label="用户名前缀"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Select onChange={null}>
                                        <Option value="uid">uid</Option>
                                        <Option value="cn">cn</Option>
                                        <Option value="sn">sn</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_synauth"
                                    label="用户同步"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => {
                                        this.setState({
                                            ldapproperties: {
                                                ...this.state.ldapproperties,
                                                'LDAP_synauth': checked,
                                            }
                                        })
                                    }}/>
                                </Form.Item>
                                {
                                    this.state.ldapproperties['LDAP_synauth'] === true ?
                                        <>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="LDAP_syntime"
                                                label="同步时间设置"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <Input type="text" placeholder="输入cron表达式"/>
                                            </Form.Item>
                                        </> : null
                                }
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                                <Divider />
                                <Form.Item
                                    {...formItemLayout}
                                    name="user_name"
                                    label="测试用户名"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="password"
                                    label="测试密码"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button  style={{marginleft:35,backgroundColor:'#F7F7F7'}} onClick={this.ldaptestProperties}>
                                        连接测试
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="AD认证配置" key="ad">
                            <Form ref={this.adSettingFormRef} name="ad" onFinish={this.changeAdProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_auth"
                                    label="启用AD"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_server"
                                    label="服务器地址"
                                    rules={[
                                        {
                                            required: true,
                                        },

                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_port"
                                    label="端口"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='number' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_dn"
                                    label="管理员DN"
                                    initialValue=""
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_password"
                                    label="密码"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="输入密码"/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_ou"
                                    label="用户ou"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_rule"
                                    label="过滤规则"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_field"
                                    label="域"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_synauth"
                                    label="用户同步"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => {
                                        this.setState({
                                            adproperties: {
                                                ...this.state.adproperties,
                                                'AD_synauth': checked,
                                            }
                                        })
                                    }}/>
                                </Form.Item>
                                {
                                    this.state.adproperties['AD_synauth'] === true ?
                                        <>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="AD_syntime"
                                                label="同步时间设置"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <Input type="text" placeholder="输入cron表达式"/>
                                            </Form.Item>
                                        </> : null
                                }
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                                <Divider />
                                <Form.Item
                                    {...formItemLayout}
                                    name="user_name"
                                    label="测试用户名"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="password"
                                    label="测试密码"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button  style={{marginleft:35,backgroundColor:'#F7F7F7'}} onClick={this.adtestProperties}>
                                        连接测试
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

export default Authentication;
