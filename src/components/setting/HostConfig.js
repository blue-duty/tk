import React, {Component} from 'react';
import {
    Button,
    Form,
    Input,
    Layout,
    Select,
    Switch,
    Tabs,Tooltip
} from "antd";
import request from "../../common/request";
import {message} from "antd/es";
import {QuestionCircleTwoTone} from "@ant-design/icons";

const {Content} = Layout;
const {Option} = Select;
const {TabPane} = Tabs;

const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};
const formItemLayout2 = {
    labelCol: {span: 2},
    wrapperCol: {span: 8},
};
const formTailLayout = {
    wrapperCol:{ offset: 0, span:18 }
};

class HostConfig extends Component {

    state = {
        properties: {}
    }

    rdpSettingFormRef = React.createRef();
    sshSettingFormRef = React.createRef();
    vncSettingFormRef = React.createRef();
    guacdSettingFormRef = React.createRef();

    componentDidMount() {

        // eslint-disable-next-line no-extend-native
        String.prototype.bool = function () {
            return (/^true$/i).test(this);
        };

        this.getProperties();
    }

    changeProperties = async (values) => {
        let result = await request.put('/properties', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
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
                if (key.startsWith('enable') || key.startsWith("disable" || key === 'swap-red-blue')) {
                    properties[key] = properties[key].bool();
                }
            }

            this.setState({
                properties: properties
            })

            if (this.rdpSettingFormRef.current) {
                this.rdpSettingFormRef.current.setFieldsValue(properties)
            }

            if (this.sshSettingFormRef.current) {
                this.sshSettingFormRef.current.setFieldsValue(properties)
            }

            if (this.vncSettingFormRef.current) {
                this.vncSettingFormRef.current.setFieldsValue(properties)
            }

            if (this.guacdSettingFormRef.current) {
                this.guacdSettingFormRef.current.setFieldsValue(properties)
            }
        } else {
            message.error(result['message']);
        }
    }


    handleOnTabChange = () => {
        this.getProperties()
    }

    render() {

        return (
            <>
                <Content className="site-layout-background page-content">

                    <Tabs tabPosition={'top'} type="card" onChange={this.handleOnTabChange} tabBarStyle={{width: '100%'}}>

                        <TabPane tab="RDP配置" key="rdp">
                            <Form ref={this.rdpSettingFormRef} name="rdp" onFinish={this.changeProperties}
                                  layout="horizontal" labelAlign="left">

                                <Form.Item
                                    {...formItemLayout}
                                    name="enable-wallpaper"
                                    label="启用桌面墙纸"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="enable-theming"
                                    label="启用桌面主题"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout}
                                    name="enable-font-smoothing"
                                    label="启用字体平滑（ClearType）"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="enable-full-window-drag"
                                    label="启用全窗口拖拽"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="enable-menu-animations"
                                    label="启用菜单动画"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
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
                        </TabPane>
                        <TabPane tab="SSH/TELNET配置" key="ssh">
                            <Form ref={this.sshSettingFormRef} name="ssh" onFinish={this.changeProperties}
                                  layout="horizontal" labelAlign="left">

                                <Form.Item
                                    {...formItemLayout2}
                                    name="color-scheme"
                                    label="配色方案"
                                    rules={[
                                        {
                                            required: true,
                                            message: '配色方案',
                                        },
                                    ]}
                                    initialValue="gray-black"
                                >
                                    <Select onChange={null}>
                                        <Option value="gray-black">黑底灰字</Option>
                                        <Option value="green-black">黑底绿字</Option>
                                        <Option value="white-black">黑底白字</Option>
                                        <Option value="black-white">白底黑字</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout2}
                                    name="font-name"
                                    label="字体名称"
                                    rules={[
                                        {
                                            required: true,
                                            message: '字体名称',
                                        },
                                    ]}
                                >
                                    <Input type='text' placeholder="请输入字体名称"/>
                                </Form.Item>

                                <Form.Item
                                    {...formItemLayout2}
                                    name="font-size"
                                    label="字体大小"
                                    rules={[
                                        {
                                            required: true,
                                            message: '字体大小',
                                        },
                                    ]}
                                >
                                    <Input type='number' placeholder="请输入字体大小"/>
                                </Form.Item>

                                <Form.Item {...formTailLayout}>
                                    <Button type="primary" htmlType="submit" className='btnTool'>
                                        更新
                                    </Button>
                                    <Tooltip title="SSH仅针对非指令控制模式">
                                        <QuestionCircleTwoTone className='btnTool2' />
                                    </Tooltip>
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="录屏配置" key="other">
                            <Form ref={this.guacdSettingFormRef} name="other" onFinish={this.changeProperties}
                                  layout="horizontal" labelAlign="left">

                                <Form.Item
                                    {...formItemLayout}
                                    name="enable-recording"
                                    label="开启录屏"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked, event) => {
                                        this.setState({
                                            properties: {
                                                ...this.state.properties,
                                                'enable-recording': checked,
                                            }
                                        })
                                    }}/>
                                </Form.Item>
                                {
                                    this.state.properties['enable-recording'] === true ?
                                        <>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="session-saved-limit"
                                                label="会话录屏保存时长"
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
                                        </> : null
                                }

                                <Form.Item
                                    {...formItemLayout}
                                    name="recording_save_time"
                                    label="录屏解码文件保存时长"
                                    initialValue="1"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Select>
                                        <Option value="1">1小时</Option>
                                        <Option value="8">8小时</Option>
                                        <Option value="24">24小时</Option>
                                    </Select>
                                </Form.Item>

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

export default HostConfig;
