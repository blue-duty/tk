import React, {useEffect, useState} from 'react';
import {
    Col,
    Collapse,
    Form,
    Input,
    InputNumber,
    Modal,
    Radio,
    Row,
    Select,
    Switch,
    Tooltip,
    Typography
} from "antd";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import request from "../../common/request";
import {isEmpty} from "../../utils/utils";

const {TextArea} = Input;
const {Option} = Select;
const {Text} = Typography;
const {Panel} = Collapse;

// 子级页面
// Ant form create 表单内置方法

const protocolMapping = {
    'ssh': [
        {text: '密码', value: 'custom'},
        {text: '密钥', value: 'private-key'},
        {text: '授权凭证', value: 'credential'},
    ],
    'rdp': [{text: '密码', value: 'custom'}, {text: '授权凭证', value: 'credential'}],
    'vnc': [{text: '密码', value: 'custom'}, {text: '授权凭证', value: 'credential'}],
    'telnet': [{text: '密码', value: 'custom'}, {text: '授权凭证', value: 'credential'}]
}

const formLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
};

const AssetModal = function ({title, visible, handleOk, handleCancel, confirmLoading, credentials, tags, model}) {

    const [form] = Form.useForm();

    if (model.accountType === undefined) {
        model.accountType = 'rdp';
    }
    if(model['ssh-mode'] === undefined){
        model['ssh-mode'] = 'native'
    }
    let [accountType, setAccountType] = useState(model.accountType);
    let [protocol, setProtocol] = useState(model.protocol);
    let [sshMode, setSshMode] = useState(model['ssh-mode']);

    let initAccountTypes = []
    if (model.protocol) {
        initAccountTypes = protocolMapping[model.protocol];
    }
    let [accountTypes, setAccountTypes] = useState(initAccountTypes);
    let [useSSL, setUseSSL] = useState(model['use-ssl']);

    for (let key in model) {
        if (model.hasOwnProperty(key)) {
            if (model[key] === '-') {
                model[key] = '';
            }
        }
    }

    const handleProtocolChange = e => {
        setProtocol(e.target.value)
        let port;
        switch (e.target.value) {
            case 'ssh':
                port = 22;
                setAccountTypes(protocolMapping['ssh']);
                form.setFieldsValue({
                    accountType: 'custom',
                });
                handleAccountTypeChange('custom');
                break;
            case 'rdp':
                port = 3389;
                setAccountTypes(protocolMapping['rdp']);
                form.setFieldsValue({
                    accountType: 'custom',
                });
                handleAccountTypeChange('custom');
                break;
            case 'vnc':
                port = 5900;
                setAccountTypes(protocolMapping['vnc']);
                form.setFieldsValue({
                    accountType: 'custom',
                });
                handleAccountTypeChange('custom');
                break;
            case 'telnet':
                port = 23;
                setAccountTypes(protocolMapping['telnet']);
                form.setFieldsValue({
                    accountType: 'custom',
                });
                handleAccountTypeChange('custom');
                break;
            case 'kubernetes':
                port = 6443;
                break
            default:
                port = 65535;
        }

        form.setFieldsValue({
            port: port,
        });
    };

    const handleAccountTypeChange = v => {
        setAccountType(v);
        model.accountType = v;
    }

    let [enableDrive, setEnableDrive] = useState(model['enable-drive']);
    // let [socksProxyEnable, setSocksProxyEnable] = useState(model['socks-proxy-enable']);
    let [storages, setStorages] = useState([]);
    useEffect(() => {
        const getStorages = async () => {
            const result = await request.get('/storages/shares');
            if (result.code === 1) {
                setStorages(result['data']);
            }
        }
        getStorages();
    }, []);

    return (

        <Modal
            title={title}
            visible={visible}
            maskClosable={false}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        values['ssh-mode'] = sshMode
                        form.resetFields();
                        handleOk(values);
                    })
                    .catch(info => {
                    });
            }}
            width={960}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
            centered={true}
            cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
        >

            <Form form={form} {...formLayout} initialValues={model} size='small'>
                <Row>
                    <Col span={13}>
                        <Form.Item name='id' noStyle>
                            <Input hidden={true}/>
                        </Form.Item>

                        <Form.Item label="主机名称" name='name' rules={[{required: true, message: "请输入主机名称"}]}>
                            <Input placeholder="主机名称"/>
                        </Form.Item>

                        <Form.Item label="主机IP" name='ip' rules={[{required: true, message: '请输入主机的IP地址'}]}>
                            <Input placeholder="主机的IP地址"/>
                        </Form.Item>

                        <Form.Item label="接入协议" name='protocol' rules={[{required: true, message: '请选择接入协议'}]}>
                            <Radio.Group onChange={handleProtocolChange}>
                                <Radio value="rdp">RDP</Radio>
                                <Radio value="ssh">SSH</Radio>
                                <Radio value="telnet">Telnet</Radio>
                                <Radio value="vnc">VNC</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item label="端口号" name='port' rules={[{required: true, message: '请输入端口号'}]}>
                            <InputNumber min={1} max={65535} placeholder='TCP端口'/>
                        </Form.Item>

                        {
                            protocol === 'kubernetes' ? <>
                                <Form.Item
                                    name="namespace"
                                    label="命名空间"
                                >
                                    <Input type='text' placeholder="为空时默认使用default命名空间"/>
                                </Form.Item>

                                <Form.Item
                                    name="pod"
                                    label="pod"
                                    rules={[{required: true, message: '请输入Pod名称'}]}
                                >
                                    <Input type='text' placeholder="Kubernetes Pod的名称，其中包含与之相连的容器。"/>
                                </Form.Item>

                                <Form.Item
                                    name="container"
                                    label="容器"
                                >
                                    <Input type='text' placeholder="为空时默认使用第一个容器"/>
                                </Form.Item>
                            </> : <>
                                <Form.Item label="账户类型" name='accountType'
                                           rules={[{required: true, message: '请选择接账户类型'}]}>
                                    <Select onChange={handleAccountTypeChange}>
                                        {accountTypes.map(item => {
                                            return (<Option key={item.value} value={item.value}>{item.text}</Option>)
                                        })}
                                    </Select>
                                </Form.Item>


                                {
                                    accountType === 'credential' ?
                                        <Form.Item label="授权凭证" name='credentialId'
                                                   rules={[{required: true, message: '请选择授权凭证'}]}>
                                            <Select onChange={() => null}>
                                                {credentials.map(item => {
                                                    return (
                                                        <Option key={item.id} value={item.id}>
                                                            <Tooltip placement="topLeft" title={item.name}>
                                                                {item.name}
                                                            </Tooltip>
                                                        </Option>
                                                    );
                                                })}
                                            </Select>
                                        </Form.Item>
                                        : null
                                }

                                {
                                    accountType === 'custom' ?
                                        <>
                                            {
                                                protocol === 'vnc' ?
                                                    <Form.Item label="授权账户" name='username'
                                                               noStyle={!(accountType === 'custom')}>
                                                        <Input placeholder="输入授权账户"/>
                                                    </Form.Item>:
                                                    <Form.Item label="授权账户" name='username'
                                                               noStyle={!(accountType === 'custom')}
                                                               rules={[{required: true, message: '请选择授权账户'}]}
                                                    >
                                                        <Input placeholder="输入授权账户"/>
                                                    </Form.Item>
                                            }

                                            <Form.Item label="授权密码" name='password'
                                                       noStyle={!(accountType === 'custom')}
                                                       rules={[{required: true, message: '请选择授权密码'}]}
                                            >
                                                <Input.Password placeholder="输入授权密码"/>
                                            </Form.Item>
                                        </>
                                        : null
                                }

                                {
                                    accountType === 'private-key' ?
                                        <>
                                            <Form.Item label="授权账户" name='username'>
                                                <Input placeholder="输入授权账户"/>
                                            </Form.Item>

                                            <Form.Item label="私钥" name='privateKey'
                                                       rules={[{required: true, message: '请输入私钥'}]}>
                                                <TextArea rows={4}/>
                                            </Form.Item>
                                            <Form.Item label="私钥密码" name='passphrase'>
                                                <TextArea rows={1}/>
                                            </Form.Item>
                                        </>
                                        : null
                                }
                            </>
                        }

                        <Form.Item label="标签" name='tags'>
                            <Select mode="tags" placeholder="标签可以更加方便的检索资产">
                                {tags.map(tag => {
                                    if (tag === '-') {
                                        return undefined;
                                    }
                                    return (<Option key={tag}>{tag}</Option>)
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item label="备注" name='description'>
                            <TextArea rows={4} placeholder='关于资产的一些信息您可以写在这里'/>
                        </Form.Item>
                    </Col>
                    <Col span={11}>
                        <Collapse defaultActiveKey={['remote-app', '认证', 'storage']} ghost>
                            {
                                protocol === 'rdp' ?
                                    <>
                                        <Panel header={<Text strong>认证</Text>} key="认证">
                                            <Form.Item
                                                name="domain"
                                                label='域'
                                            >
                                                <Input type='text' placeholder="身份验证时使用的域"/>
                                            </Form.Item>
                                        </Panel>
                                        <Panel header={<Text strong>Remote App</Text>} key="remote-app">
                                            <Form.Item
                                                name="remote-app"
                                                label={<Tooltip title="指定在远程桌面上启动的RemoteApp。
如果您的远程桌面服务器支持该应用程序，则该应用程序(且仅该应用程序)对用户可见。

Windows需要对远程应用程序的名称使用特殊的符号。
远程应用程序的名称必须以两个竖条作为前缀。
例如，如果您已经在您的服务器上为notepad.exe创建了一个远程应用程序，并将其命名为“notepad”，则您将该参数设置为:“||notepad”。">
                                                    程序&nbsp;<ExclamationCircleOutlined/>
                                                </Tooltip>}
                                            >
                                                <Input type='text' placeholder="remote app"/>
                                            </Form.Item>

                                            <Form.Item
                                                name="remote-app-dir"
                                                label={<Tooltip
                                                    title="remote app的工作目录，如果未配置remote app，此参数无效。">工作目录&nbsp;
                                                    <ExclamationCircleOutlined/></Tooltip>}
                                            >
                                                <Input type='text' placeholder="remote app的工作目录"/>
                                            </Form.Item>

                                            <Form.Item
                                                name="remote-app-args"
                                                label={<Tooltip title="remote app的命令行参数，如果未配置remote app，此参数无效。">参数&nbsp;
                                                    <ExclamationCircleOutlined/></Tooltip>}
                                            >
                                                <Input type='text' placeholder="remote app的命令行参数"/>
                                            </Form.Item>
                                        </Panel>
                                        <Panel header={<Text strong>映射网络驱动器</Text>} key="storage">
                                            <Form.Item
                                                name="enable-drive"
                                                label="启用"
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren="开启" unCheckedChildren="关闭"
                                                        onChange={(checked, event) => {
                                                            setEnableDrive(checked);
                                                        }}/>
                                            </Form.Item>
                                            {
                                                enableDrive ?
                                                    <Form.Item
                                                        name="drive-path"
                                                        label="映射空间"
                                                        tooltip='用于文件传输的映射网络驱动器，为空时使用操作人的默认空间'
                                                    >
                                                        <Select onChange={null} allowClear placeholder='为空时使用操作人的默认空间'>
                                                            {
                                                                storages.map(item => {
                                                                    return <Option
                                                                        value={item['id']}>{item['name']}</Option>
                                                                })
                                                            }
                                                        </Select>
                                                    </Form.Item> : undefined
                                            }

                                        </Panel>
                                    </> : undefined
                            }

                            {
                                protocol === 'ssh' ?
                                    <>
                                        <Panel header={<Text strong>模式设置</Text>} key="模式设置">
                                            <Form.Item
                                                name="ssh-mode"
                                                label='连接模式'
                                                tooltip={<span>指令控制模式会比非指令控制模式增加额外的速度开销。<br/>
                                                非指令控制模式不支持某些最新版本的ssh服务器密钥，此时需对服务器进行额外配置，或使用指令控制模式。
                                                </span>}
                                            >
                                                <Select onChange={(value) => {
                                                    setSshMode(value)
                                                }}>
                                                    <Option value="native">指令控制</Option>
                                                    <Option value="guacd">非指令控制</Option>
                                                </Select>
                                            </Form.Item>
                                        </Panel>
                                        {
                                            isEmpty(sshMode) || sshMode === 'guacd' ?
                                                <>
                                                    <Panel header={<Text strong>显示设置</Text>} key="显示设置">
                                                        <Form.Item
                                                            name="color-scheme"
                                                            label="配色方案"
                                                            initialValue=""
                                                        >
                                                            <Select onChange={null}>
                                                                <Option value="">默认</Option>
                                                                <Option value="gray-black">黑底灰字</Option>
                                                                <Option value="green-black">黑底绿字</Option>
                                                                <Option value="white-black">黑底白字</Option>
                                                                <Option value="black-white">白底黑字</Option>
                                                            </Select>
                                                        </Form.Item>

                                                        <Form.Item
                                                            name="font-name"
                                                            label="字体名称"
                                                        >
                                                            <Input type='text' placeholder="为空时使用系统默认字体"/>
                                                        </Form.Item>

                                                        <Form.Item
                                                            name="font-size"
                                                            label="字体大小"
                                                        >
                                                            <Input type='number' placeholder="为空时使用系统默认字体大小" min={8}
                                                                   max={96}/>
                                                        </Form.Item>
                                                    </Panel>
                                                </> : undefined
                                        }

                                    </> : undefined
                            }

                            {
                                protocol === 'vnc' ?
                                    <>
                                        <Panel header={<Text strong>提示</Text>} key="提示">
                                            <div style={{width:'90%',marginLeft:20}}>
                                                <p>vnc服务器推荐使用tigervnc server，堡垒机与其数据传输速率最快。</p>
                                                <p>其余vnc server可能需要额外配置才能其保证稳定性与适配性，如real vnc较新版本，因其使用的是非公开标准的vnc协议认证方法，若不进行配置，则无法连接。</p>
                                            </div>
                                        </Panel>
                                    </> : undefined
                            }


                            {
                                protocol === 'telnet' ?
                                    <>
                                        <Panel header={<Text strong>显示设置</Text>} key="显示设置">
                                            <Form.Item
                                                name="color-scheme"
                                                label="配色方案"
                                                initialValue=""
                                            >
                                                <Select onChange={null}>
                                                    <Option value="">默认</Option>
                                                    <Option value="gray-black">黑底灰字</Option>
                                                    <Option value="green-black">黑底绿字</Option>
                                                    <Option value="white-black">黑底白字</Option>
                                                    <Option value="black-white">白底黑字</Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                name="font-name"
                                                label="字体名称"
                                            >
                                                <Input type='text' placeholder="为空时使用系统默认字体"/>
                                            </Form.Item>

                                            <Form.Item
                                                name="font-size"
                                                label="字体大小"
                                            >
                                                <Input type='number' placeholder="为空时使用系统默认字体大小" min={8} max={96}/>
                                            </Form.Item>
                                        </Panel>
                                    </> : undefined
                            }

                            {
                                protocol === 'kubernetes' ?
                                    <>
                                        <Panel header={<Text strong>认证</Text>} key="认证">
                                            <Form.Item
                                                name="use-ssl"
                                                label="使用SSL"
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren="是" unCheckedChildren="否"
                                                        onChange={(checked, event) => {
                                                            setUseSSL(checked);
                                                        }}/>
                                            </Form.Item>

                                            {
                                                useSSL ?
                                                    <>
                                                        <Form.Item
                                                            name="client-cert"
                                                            label="client-cert"
                                                        >
                                                            <Input type='text' placeholder=""/>
                                                        </Form.Item>

                                                        <Form.Item
                                                            name="client-key"
                                                            label="client-key"
                                                        >
                                                            <Input type='text' placeholder=""/>
                                                        </Form.Item>

                                                        <Form.Item
                                                            name="ca-cert"
                                                            label="ca-cert"
                                                        >
                                                            <Input type='text' placeholder=""/>
                                                        </Form.Item>
                                                    </> : undefined
                                            }


                                            <Form.Item
                                                name="ignore-cert"
                                                label="忽略证书"
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren="是" unCheckedChildren="否"
                                                        onChange={(checked, event) => {

                                                        }}/>
                                            </Form.Item>

                                        </Panel>
                                        <Panel header={<Text strong>显示设置</Text>} key="显示设置">
                                            <Form.Item
                                                name="color-scheme"
                                                label="配色方案"
                                                initialValue=""
                                            >
                                                <Select onChange={null}>
                                                    <Option value="">默认</Option>
                                                    <Option value="gray-black">黑底灰字</Option>
                                                    <Option value="green-black">黑底绿字</Option>
                                                    <Option value="white-black">黑底白字</Option>
                                                    <Option value="black-white">白底黑字</Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                name="font-name"
                                                label="字体名称"
                                            >
                                                <Input type='text' placeholder="为空时使用系统默认字体"/>
                                            </Form.Item>

                                            <Form.Item
                                                name="font-size"
                                                label="字体大小"
                                            >
                                                <Input type='number' placeholder="为空时使用系统默认字体大小" min={8} max={96}/>
                                            </Form.Item>
                                        </Panel>
                                        <Panel header={<Text strong>控制终端行为</Text>} key="控制终端行为">
                                            <Form.Item
                                                name="backspace"
                                                label="退格键映射"
                                                initialValue=""
                                            >
                                                <Select onChange={null}>
                                                    <Option value="">默认</Option>
                                                    <Option value="127">删除键(Ctrl-?)</Option>
                                                    <Option value="8">退格键(Ctrl-H)</Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                name="terminal-type"
                                                label="终端类型"
                                                initialValue=""
                                            >
                                                <Select onChange={null}>
                                                    <Option value="">默认</Option>
                                                    <Option value="ansi">ansi</Option>
                                                    <Option value="linux">linux</Option>
                                                    <Option value="vt100">vt100</Option>
                                                    <Option value="vt220">vt220</Option>
                                                    <Option value="xterm">xterm</Option>
                                                    <Option value="xterm-256color">xterm-256color</Option>
                                                </Select>
                                            </Form.Item>
                                        </Panel>
                                    </> : undefined
                            }
                        </Collapse>
                    </Col>
                </Row>


            </Form>
        </Modal>
    )
}

export default AssetModal;
