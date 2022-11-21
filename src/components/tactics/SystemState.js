import React, {Component} from 'react';
import {Layout, Card, Form, Input, Radio, Checkbox, Button, Select, InputNumber, Typography} from "antd";
import request from "../../common/request";
import {message} from "antd/es";
import './SystemState.css'


const {Content} = Layout;
const { Option } = Select;
const {Text} = Typography;

const formItemLayout = {
    labelCol: {span: 2.5},
    wrapperCol: {span: 10},
};

const formTailLayout = {
    wrapperCol: {span: 12,offset:2},
};


class SystemState extends Component {

    state = {
        properties: {},

    }

    alarmSetFormRef = React.createRef();

    componentDidMount() {
        this.getProperties();
    }

    getProperties = async () => {
        let result = await request.get('/policy-configs');
        if (result['code'] === 1) {
            let properties = result['data'];
            this.setState({
                properties: properties
            })
            this.alarmSetFormRef.current.setFieldsValue(properties)
        } else {
            message.error(result['message']);
        }
    }

    saveProperties = async (values) => {
        let result = await request.put('/policy-configs', values);
        if (result.code === 1) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    }

    sendTestMail = async () => {
        let result = await request.post('/policy-configs/send-test-mail','');
        if (result.code === 1) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    }


    render() {
        const suffixSelector = (
            <Form.Item name="frequencyTimeType" noStyle>
                <Select
                    style={{
                        width: 80,
                    }}
                >
                    <Option value="second">秒</Option>
                    <Option value="minute">分</Option>
                    <Option value="hour">时</Option>
                    <Option value="day">天</Option>
                    <Option value="month">月</Option>
                </Select>
            </Form.Item>
        );
        return (
            <>
                <Content className="site-layout-background page-content">
                    <Card title={<Text italic style={{fontSize:20,color:'#666',fontWeight: 600}}>系统状态</Text>}
                          bordered={false}>
                        <Form ref={this.alarmSetFormRef} name="alarm" onFinish={this.saveProperties}>
                            <Form.Item name='id' noStyle>
                                <Input hidden={true}/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="E-mail事件告警"
                                name="statusAll"
                                rules={[
                                    {
                                        required: true,
                                        message: '请选择E-mail事件告警是否启用!',
                                    },
                                ]}
                            >
                                <Radio.Group>
                                    <Radio className="setRadio" value={1}>启用</Radio>
                                    <Radio value={0}>禁用</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item>
                                <Form.Item label="系统盘占用" className="set" name="statusSystemDisk" valuePropName='checked'>
                                    <Checkbox/>
                                </Form.Item>
                                <Form.Item label="持续" className="set" name="continuedSystemDisk">
                                    <InputNumber addonAfter="秒" min={0} max={60} placeholder="30" />
                                </Form.Item>
                                <Form.Item label="超过" className="set" name="thresholdSystemDisk">
                                    <InputNumber addonAfter="%" placeholder="30" />
                                </Form.Item>
                            </Form.Item>
                            <Form.Item>
                                <Form.Item label="数据盘占用" className="set" name="statusDataDisk" valuePropName='checked'>
                                    <Checkbox/>
                                </Form.Item>
                                <Form.Item label="持续" className="set" name="continuedDataDisk">
                                    <InputNumber addonAfter="秒" min={0} max={60} placeholder="30" />
                                </Form.Item>
                                <Form.Item label="超过" className="set" name="thresholdDataDisk">
                                    <InputNumber addonAfter="%" placeholder="30" />
                                </Form.Item>
                            </Form.Item>
                            <Form.Item>
                                <Form.Item label="内存占用" className="set" name="statusMemory" valuePropName='checked'>
                                    <Checkbox/>
                                </Form.Item>
                                <Form.Item label="持续" className="set" name="continuedMemory">
                                    <InputNumber addonAfter="秒" min={0} max={60} placeholder="30" />
                                </Form.Item>
                                <Form.Item label="超过" className="set" name="thresholdMemory">
                                    <InputNumber addonAfter="%" placeholder="30" />
                                </Form.Item>
                            </Form.Item>
                            <Form.Item>
                                <Form.Item label="CPU负荷" className="set" name="statusCpu" valuePropName='checked'>
                                    <Checkbox/>
                                </Form.Item>
                                <Form.Item label="持续" className="set" name="continuedCpu">
                                    <InputNumber addonAfter="秒" min={0} max={60} placeholder="30" />
                                </Form.Item>
                                <Form.Item label="超过" className="set" name="thresholdCpu">
                                    <InputNumber addonAfter="%" placeholder="30" />
                                </Form.Item>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="告警邮件发送频率"
                                name="frequency"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入告警邮件发送频率!',
                                    },
                                ]}
                            >
                                <InputNumber addonAfter={suffixSelector} className="setMail" placeholder="请输入" />
                            </Form.Item>
                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    保存
                                </Button>
                                <Button className='test-btn' onClick={this.sendTestMail}>
                                    发送测试邮件
                                </Button>
                            </Form.Item>

                        </Form>
                    </Card>

                </Content>
            </>
        );
    }
}

export default SystemState;
