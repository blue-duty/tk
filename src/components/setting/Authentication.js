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
            message.success('????????????');
        } else {
            message.error(result.message);
        }
    }
    changeLdapProperties = async (values) => {
        let result = await request.post('/authen/ldap', values);
        if (result.code === 1) {
            message.success('????????????');
        } else {
            message.error(result.message);
        }
    }

    changeAdProperties = async (values) => {
        let result = await request.post('/authen/ad', values);
        if (result.code === 1) {
            message.success('????????????');
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
                    message.success('????????????');
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
                    message.success('????????????');
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
                        <TabPane tab="RADIUS????????????" key="radius">
                            <Form ref={this.radiusSettingFormRef} name="radius" onFinish={this.changeRadiusProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_auth"
                                    label="??????RADIUS"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="??????" unCheckedChildren="??????"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_server"
                                    label="???????????????"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                        {
                                            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                            message: '??????????????????ip??????'
                                        }
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="radius_port"
                                    label="??????"
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
                                    label="????????????"
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
                                    label="????????????"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="??????????????????"/>
                                </Form.Item>

                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        ??????
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="LDAP????????????" key="ldap">
                            <Form ref={this.ldapSettingFormRef} name="ldap" onFinish={this.changeLdapProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_auth"
                                    label="??????LDAP"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="??????" unCheckedChildren="??????"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_server"
                                    label="???????????????"
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
                                    label="??????"
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
                                    label="?????????DN"
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
                                    label="??????"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="????????????"/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="LDAP_ou"
                                    label="??????ou"
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
                                    label="????????????"
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
                                    label="???????????????"
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
                                    label="????????????"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="??????" unCheckedChildren="??????" onChange={(checked) => {
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
                                                label="??????????????????"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <Input type="text" placeholder="??????cron?????????"/>
                                            </Form.Item>
                                        </> : null
                                }
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        ??????
                                    </Button>
                                </Form.Item>
                                <Divider />
                                <Form.Item
                                    {...formItemLayout}
                                    name="user_name"
                                    label="???????????????"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="password"
                                    label="????????????"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button  style={{marginleft:35,backgroundColor:'#F7F7F7'}} onClick={this.ldaptestProperties}>
                                        ????????????
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="AD????????????" key="ad">
                            <Form ref={this.adSettingFormRef} name="ad" onFinish={this.changeAdProperties}
                                  layout="horizontal" labelAlign="left">
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_auth"
                                    label="??????AD"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="??????" unCheckedChildren="??????"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_server"
                                    label="???????????????"
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
                                    label="??????"
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
                                    label="?????????DN"
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
                                    label="??????"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="????????????"/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="AD_ou"
                                    label="??????ou"
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
                                    label="????????????"
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
                                    label="???"
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
                                    label="????????????"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="??????" unCheckedChildren="??????" onChange={(checked) => {
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
                                                label="??????????????????"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <Input type="text" placeholder="??????cron?????????"/>
                                            </Form.Item>
                                        </> : null
                                }
                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit">
                                        ??????
                                    </Button>
                                </Form.Item>
                                <Divider />
                                <Form.Item
                                    {...formItemLayout}
                                    name="user_name"
                                    label="???????????????"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="password"
                                    label="????????????"

                                >
                                    <Input type='text' />
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button  style={{marginleft:35,backgroundColor:'#F7F7F7'}} onClick={this.adtestProperties}>
                                        ????????????
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
