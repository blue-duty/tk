import React, {Component} from 'react';
import {Layout, Card, Form, Checkbox, Button, InputNumber, Input, Typography} from "antd";
import request from "../../common/request";
import {message} from "antd/es";


const {Content} = Layout;
const {Text} = Typography;

const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 10},
};

const formCheckLayout = {
    wrapperCol: {span: 10,offset: 3},
};

const formTailLayout = {
    wrapperCol: {span: 12,offset:4},
};


class PasswordSet extends Component {

    state = {
        properties: {},

    }

    psdSetFormRef = React.createRef();

    componentDidMount() {
        this.getProperties();
    }

    getProperties = async () => {
        let result = await request.get('/identity-configs');
        if (result['code'] === 1) {
            let properties = result['data'];
            this.setState({
                properties: properties
            })
            this.psdSetFormRef.current.setFieldsValue(properties)
        } else {
            message.error(result['message']);
        }
    }

    saveProperties = async (values) => {
        let result = await request.put('/identity-configs', values);
        if (result.code === 1) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    }


    render() {
        return (
            <>
                <Content className="site-layout-background page-content">
                    <Card title={<Text italic style={{fontSize:20,color:'#666',fontWeight: 600}}>身份鉴别</Text>}
                          bordered={false}>
                        <Form ref={this.psdSetFormRef} name="psd" onFinish={this.saveProperties}>
                            <Form.Item name='id' noStyle>
                                <Input hidden={true}/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="最大登陆失败次数"
                                name="loginFailTimes"
                            >
                                <InputNumber min={0} addonAfter="次" placeholder="请输入"  />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="系统超时注销时长"
                                name="expirationTime"
                            >
                                <InputNumber addonAfter="分" placeholder="请输入" />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="密码不少于"
                                name="passwordLength"
                            >
                                <InputNumber addonAfter="位" placeholder="请输入"  />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="密码过期时间"
                                name="expireTime"
                            >
                                <InputNumber addonAfter="天" placeholder="请输入" />
                            </Form.Item>
                            <Form.Item {...formCheckLayout} valuePropName='checked' name="passwordNum">
                                <Checkbox>密码必须包含数字</Checkbox>
                            </Form.Item>
                            <Form.Item {...formCheckLayout} valuePropName='checked' name="passwordLower">
                                <Checkbox>密码必须包含小写字母</Checkbox>
                            </Form.Item>
                            <Form.Item {...formCheckLayout} valuePropName='checked' name="passwordUpper">
                                <Checkbox>密码必须包含大写字母</Checkbox>
                            </Form.Item>
                            <Form.Item {...formCheckLayout} valuePropName='checked' name="passwordSpecial">
                                <Checkbox>密码必须包含特殊字符</Checkbox>
                            </Form.Item>
                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    保存
                                </Button>
                            </Form.Item>

                        </Form>
                    </Card>

                </Content>
            </>
        );
    }
}

export default PasswordSet;
