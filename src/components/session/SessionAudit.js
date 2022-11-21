import React, {Component} from 'react';

import {
    Button, Col, Input,Row,
    Layout, Modal, Space, Table,
    Tooltip, Typography, Tabs,
    Form, Select, Checkbox, Tag, notification, DatePicker
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, ExclamationCircleOutlined, UpOutlined} from '@ant-design/icons';
import {differTime, download, getToken} from "../../utils/utils";
import {server} from "../../common/env";
import {MODE_COLORS, PROTOCOL_COLORS} from "../../common/constants";
import AccessMonitor from "../access/AccessMonitor";
import TermMonitor from "../access/TermMonitor";
import Playback from "./Playback";

const confirm = Modal.confirm;
const {Content} = Layout;
const {Text} = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class SessionAudit extends Component {

    onlineFormRef = React.createRef();
    offlineFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            protocol: '',
            userId: undefined,
            assetId: undefined
        },
        loading: false,
        selectedRowKeys: [],
        delBtnLoading: false,
        users: [],
        assets: [],
        accessVisible: false,
        sessionWidth: 1024,
        sessionHeight: 768,
        sessionProtocol: '',
        sessionMode: '',
        display:'none',
        judge:'down',
        startTime:'',//开始时间
        endTime:'',  //结束时间
        //第二张表
        items2: [],
        total2: 0,
        queryParams2: {
            pageIndex: 1,
            pageSize: 10,
            protocol: '',
            userId: undefined,
            assetId: undefined
        },
        loading2: false,
        playbackVisible: false,
        playbackSessionId: null,
        videoPlayerVisible: false,
        videoPlayerSource: null,
        selectedRowKeys2:[],
        delBtnLoading2: false,
        selectedRow:{},
        cmdLoading: false,
        cmdItems:[],
        cmdTotal:0,
        display2:'none',
        judge2:'down',
        startTime2:'',//开始时间
        endTime2:'',  //结束时间

    };

    componentDidMount() {
        this.loadTableData();
        this.handleSearchByUsername('');
        this.handleSearchByAssetName('');
        this.loadTableData2();
    }

    handleOnTabChange = () => {
        this.loadTableData();
        this.handleSearchByUsername('');
        this.handleSearchByAssetName('');
        this.loadTableData2();
    }

    async loadTableData(queryParams) {
        this.setState({
            loading: true
        });

        queryParams = queryParams || this.state.queryParams;
        queryParams['status'] = 'connected';

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/sessions/paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items: items,
                total: data.total,
                queryParams: queryParams,
                loading: false
            });
        }
    }

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams)
    };

    batchDis = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.post('/sessions/' + this.state.selectedRowKeys.join(',') + '/disconnect');
            if (result.code === 1) {
                message.success('操作成功', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('删除失败: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    showMonitor = (record) => {

        this.setState({
            sessionId: record.id,
            sessionProtocol: record.protocol,
            sessionMode: record.mode,
            accessVisible: true,
            sessionWidth: record.width,
            sessionHeight: record.height,
            sessionTitle: `${record.username}@${record.ip}:${record.port} ${record.width}x${record.height}`
        })
    }

    handleSearchByUsername = async username => {
        const result = await request.get(`/users/paging?pageIndex=1&pageSize=1000&username=${username}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }

        this.setState({
            users: result.data.items
        })
    }

    handleSearchByAssetName = async assetName => {
        const result = await request.get(`/assets/paging?pageIndex=1&pageSize=100&name=${assetName}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }

        this.setState({
            assets: result.data.items
        })
    }

    onPickerChange = (value, dateString) => {
        this.setState({
            startTime: dateString[0],
            endTime: dateString[1],
        });
    }

    //搜索
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'userId': values.userId,
            'clientIp': values.clientIp,
            'assetId': values.assetId,
            'protocol': values.protocol,
            'beginTime': this.state.startTime,
            'endTime': this.state.endTime,
        }
        this.setState({
            userId: values.userId,
            clientIp: values.clientIp,
            assetId: values.assetId,
            protocol: values.protocol,
        })
        this.loadTableData(query)
    }

    //导出
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'userId': this.state.userId,
            'clientIp': this.state.clientIp,
            'status': 'connected',
            'assetId': this.state.assetId,
            'protocol': this.state.protocol,
            'beginTime': this.state.startTime,
            'endTime': this.state.endTime,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}/sessions/export?${queryStr}`);
    }

    selectDataAll = () =>{
        if(this.state.items.length === this.state.selectedRowKeys.length){
            this.setState({
                selectedRowKeys: []
            })
        }else{
            const index = [];
            this.state.items.forEach(item=>{
                index.push(item.key)
            });
            this.setState({
                selectedRowKeys: index
            })
        }
    }

    //第二个页面
    async loadTableData2(queryParams) {
        queryParams = queryParams || this.state.queryParams2;
        queryParams['status'] = 'disconnected';

        this.setState({
            queryParams2: queryParams,
            loading2: true
        });

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/sessions/paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items ? data.items:[]
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items2: items,
                total2: data.total,
                queryParams2: queryParams,
                loading2: false
            });
        }
    }

    handleChangPage2 = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams2;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams2: queryParams
        });

        this.loadTableData2(queryParams)
    };

    onPickerChange2 = (value, dateString) => {
        this.setState({
            startTime2: dateString[0],
            endTime2: dateString[1],
        });
    }

    //搜索
    handleSearch2 = async (values) => {
        let query = {
            ...this.state.queryParams2,
            'pageIndex': 1,
            'pageSize': this.state.queryParams2.pageSize,
            'userId': values.userId,
            'clientIp': values.clientIp,
            "reviewed":values.reviewed,
            'assetId': values.assetId,
            'protocol': values.protocol,
            'beginTime': this.state.startTime2,
            'endTime': this.state.endTime2,
        }
        this.setState({
            userId2: values.userId,
            clientIp2: values.clientIp,
            reviewed2:values.reviewed,
            assetId2: values.assetId,
            protocol2: values.protocol,
        })
        this.loadTableData2(query)
    }

    //导出
    handleExport2 = async () =>{
        let token = getToken();
        let query = {
            'userId': this.state.userId2,
            'clientIp': this.state.clientIp2,
            'status': 'disconnected',
            'assetId': this.state.assetId2,
            'protocol': this.state.protocol2,
            'beginTime': this.state.startTime2,
            'endTime': this.state.endTime2,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}/sessions/export?${queryStr}`);
    }

    showPlayback = async (row) => {
        this.setState({
            playbackVisible: true,
            selectedRow: row,
        });
        if(row.protocol === 'ssh'){
            this.setState({cmdLoading:true})
            let data = {
                items: [],
                total: 0
            };
            try {
                let result = await request.get(`/sessions/${row.id}/record-commands`);
                if (result.code === 1) {
                    data = result.data;
                } else {
                    message.error(result.message);
                }
            } catch (e) {

            } finally {
                if(data.items === null){
                    data.items = []
                }
                const items = data.items.map(item => {
                    return {'key': item['time'], ...item}
                })
                this.setState({
                    cmdItems:items,
                    cmdTotal:data.total,
                    cmdLoading:false
                });
            }
        }
    };

    hidePlayback = () => {
        this.setState({
            playbackVisible: false,
            playbackSessionId: null
        });
    };

    batchDelete = async () => {
        this.setState({
            delBtnLoading2: true
        })
        try {
            let result = await request.delete('/sessions/' + this.state.selectedRowKeys2.join(','));
            if (result.code === 1) {
                message.success('操作成功', 3);
                this.setState({
                    selectedRowKeys2: []
                })
                await this.loadTableData2(this.state.queryParams2);
            } else {
                message.error('删除失败: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading2: false
            })
        }
    }

    clearSession = async () => {
        this.setState({
            clearBtnLoading: true
        })
        try {
            let result = await request.post('/sessions/clear');
            if (result.code === 1) {
                message.success('操作成功', 3);
                this.setState({
                    selectedRowKeys2: []
                })
                await this.loadTableData2(this.state.queryParams2);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                clearBtnLoading: false
            })
        }
    }

    handleAllReviewed = async () => {
        this.setState({
            reviewedAllBtnLoading: true
        })
        try {
            let result = await request.post(`/sessions/upreviewall`);
            if (result.code === 1) {
                message.success(result.message, 3);
                this.setState({
                    selectedRowKeys2: []
                })
                await this.loadTableData2(this.state.queryParams2);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                reviewedAllBtnLoading: false
            })
        }
    }

    handleReviewed = async () => {
        this.setState({
            reviewedBtnLoading: true
        })
        try {
            let result = await request.post(`/sessions/${this.state.selectedRowKeys2.join(',')}/upreview`);
            if (result.code === 1) {
                message.success(result.message, 3);
                this.setState({
                    selectedRowKeys2: []
                })
                await this.loadTableData2(this.state.queryParams2);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                reviewedBtnLoading: false
            })
        }
    }

    handleUnreviewed = async () => {
        this.setState({
            unreviewedBtnLoading: true
        })
        try {
            let result = await request.post(`/sessions/${this.state.selectedRowKeys2.join(',')}/upunreview`);
            if (result.code === 1) {
                message.success(result.message, 3);
                this.setState({
                    selectedRowKeys2: []
                })
                await this.loadTableData2(this.state.queryParams2);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                unreviewedBtnLoading: false
            })
        }
    }

    selectDataAll2 = () =>{
        if(this.state.items2.length === this.state.selectedRowKeys2.length){
            this.setState({
                selectedRowKeys2: []
            })
        }else{
            const index = [];
            this.state.items2.forEach(item=>{
                index.push(item.key)
            });
            this.setState({
                selectedRowKeys2: index
            })
        }
    }


    render() {

        const columns = [{
            title: '来源IP',
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: '接入方式',
            dataIndex: 'mode',
            key: 'mode',
            render: (text) => {
                return (
                    <Tag color={MODE_COLORS[text]}>{text}</Tag>
                )
            }
        }, {
            title: '用户账号',
            dataIndex: 'creatorName',
            key: 'creatorName'
        }, {
            title: '资产名称',
            dataIndex: 'assetName',
            key: 'assetName'
        }, {
            title: '连接协议',
            dataIndex: 'protocol',
            key: 'protocol',
            render: (text, record) => {
                const title = `${record.username}@${record.ip}:${record.port}`;
                return (
                    <Tooltip title={title}>
                        <Tag color={PROTOCOL_COLORS[text]}>{text}</Tag>
                    </Tooltip>
                )
            }
        }, {
            title: '接入时间',
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            render: (text, record) => {
                return text
            }
        }, {
            title: '接入时长',
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            render: (text, record) => {
                return differTime(new Date(record['connectedTime']), new Date());
            }
        },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => {

                    return (
                        <div>
                            <Button type="link" size='small' onClick={() => {
                                this.showMonitor(record)
                            }}>监控</Button>
                            <Button type="link" size='small' onClick={async () => {

                                confirm({
                                    title: '您确定要断开此会话吗?',
                                    content: '',
                                    okText: '确定',
                                    okType: 'danger',
                                    cancelText: '取消',
                                    onOk() {
                                        dis(record.id)
                                    }
                                });

                                const dis = async (id) => {
                                    const result = await request.post(`/sessions/${id}/disconnect`);
                                    if (result.code === 1) {
                                        notification['success']({
                                            message: '提示',
                                            description: '断开成功',
                                        });
                                        this.loadTableData();
                                    } else {
                                        notification['success']({
                                            message: '提示',
                                            description: '断开失败: ' + result.message,
                                        });
                                    }
                                }

                            }}>断开</Button>
                        </div>
                    )
                },
            }
        ];

        const rowSelection = {
            hideSelectAll:true,
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = this.state.selectedRowKeys.length > 0;

        const userOptions = this.state.users.map(d => <Select.Option key={d.id}
                                                                     value={d.id}>{d.username}</Select.Option>);
        const assetOptions = this.state.assets.map(d => <Select.Option key={d.id}
                                                                       value={d.id}>{d.name}</Select.Option>);
        let Message
        if (this.state.judge ==='down') {
            Message = (
                <Button icon={<DownOutlined />}
                        style={{backgroundColor:'#F7F7F7'}}
                        onClick={() => {
                            this.setState({
                                display:'block',
                                judge:'up'})
                        }}>展开更多搜索条件
                </Button>
            )
        } else {
            Message = (
                <Button icon={<UpOutlined />} style={{backgroundColor:'#F7F7F7'}} onClick={() => {
                    this.setState({
                        display:'none',
                        judge:'down'
                    })
                }}>
                    收起更多搜索条件
                </Button>
            )
        }

        let isChecked = false
        if(this.state.items.length!==0 && this.state.items.length === this.state.selectedRowKeys.length){
            isChecked = true
        }else {
            isChecked = false
        }


        const columns2 = [{
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            render: (id, record, index) => {
                return index + 1;
            }
        },{
            title: '来源IP',
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: '用户账号',
            dataIndex: 'creatorName',
            key: 'creatorName'
        }, {
            title: '资产名称',
            dataIndex: 'assetName',
            key: 'assetName'
        }, {
            title: '连接协议',
            dataIndex: 'protocol',
            key: 'protocol',
            render: (text, record) => {
                const title = `${record.username}@${record.ip}:${record.port}`;
                return (
                    <Tooltip title={title}>
                        <Tag color={PROTOCOL_COLORS[text]}>{text}</Tag>
                    </Tooltip>
                )
            }
        }, {
            title: '接入时间',
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            render: (text, record) => {
                return text
            }
        }, {
            title: '接入时长',
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            render: (text, record) => {
                return differTime(new Date(record['connectedTime']), new Date(record['disconnectedTime']));
            }
        },{
            title: '下载状态',
            dataIndex: 'videoDownload',
            key: 'videoDownload',
            render: (text, record) => {
                switch (text) {
                    case 0:
                        return '未解码';
                    case 1:
                        return '解码中';
                    case 2:
                        return '可下载';
                    default:
                        break;
                }
            }
        },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => {
                    let disabled = true;
                    if (record['recording'] && record['recording'] === '1') {
                        disabled = false
                    }

                    return (
                        <div>
                            <Button type="link" size='small'
                                    disabled={disabled}
                                    onClick={() => this.showPlayback(record)}>回放</Button>

                            <Button type="link" size='small'
                                    onClick={() => {
                                        confirm({
                                            title: '您确定要禁止该IP访问本系统吗?',
                                            content: '',
                                            okText: '确定',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: async () => {
                                                // 向后台提交数据
                                                let formData = {
                                                    ip: record['clientIp'],
                                                    rule: 'reject',
                                                    priority: 99,
                                                }
                                                const result = await request.post('/securities', formData);
                                                if (result.code === 1) {
                                                    message.success('禁用成功');
                                                } else {
                                                    message.error('禁用失败: ' + result.message, 10);
                                                }
                                            }
                                        });
                                    }}>禁用IP</Button>

                            <Button type="link" size='small'
                                    disabled={disabled}
                                    onClick={async () =>{
                                        let query = {'X-Auth-Token': getToken()}
                                        let queryStr = qs.stringify(query);
                                        //文件下载操作
                                        const result = await request.get(`${server}sessions/video/${record.id}`);
                                        switch (result.code) {
                                            case 201:
                                                notification['info']({
                                                    message: '提示',
                                                    description: '开始解码，解码成功后会在消息中心通知',
                                                });
                                                this.loadTableData2();
                                                break;
                                            case 202:
                                                notification['info']({
                                                    message: '提示',
                                                    description: '解码中，解码成功后会在消息中心通知',
                                                });
                                                this.loadTableData2();
                                                break;
                                            case 203:
                                                notification['info']({
                                                    message: '提示',
                                                    description: '文件丢失，重新解码，解码成功后会在消息中心通知',
                                                });
                                                this.loadTableData2();
                                                break;
                                            default:
                                                download(`${server}sessions/video/${record.id}?${queryStr}`);
                                                break;
                                        }
                                    } }>下载</Button>

                            <Button type="link" size='small' onClick={() => {
                                confirm({
                                    title: '您确定要删除此会话吗?',
                                    content: '',
                                    okText: '确定',
                                    okType: 'danger',
                                    cancelText: '取消',
                                    onOk() {
                                        del(record.id)
                                    }
                                });

                                const del = async (id) => {
                                    const result = await request.delete(`/sessions/${id}`);
                                    if (result.code === 1) {
                                        notification['success']({
                                            message: '提示',
                                            description: '删除成功',
                                        });
                                        this.loadTableData2();
                                    } else {
                                        notification['error']({
                                            message: '提示',
                                            description: '删除失败: ' + result.message,
                                        });
                                    }

                                }
                            }}>删除</Button>
                        </div>
                    )
                },
            }
        ];

        const rowSelection2 = {
            hideSelectAll:true,
            selectedRowKeys: this.state.selectedRowKeys2,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys2:selectedRowKeys});
            },
        };
        const hasSelected2 = this.state.selectedRowKeys2.length > 0;

        const cmdColumns=[
            {
                title: '时间',
                dataIndex: 'time',
                key: 'time',
                width:92
            },
            {
                title: '内容',
                dataIndex: 'command',
                key: 'command'
            }
        ]

        let Message2
        if (this.state.judge2 ==='down') {
            Message2 = (
                <Button icon={<DownOutlined />} onClick={() => {
                    this.setState({
                        display2:'block',
                        judge2:'up'
                    })
                }}>
                    展开更多搜索条件
                </Button>
            )
        } else {
            Message2 = (
                <Button icon={<UpOutlined />} onClick={() => {
                    this.setState({
                        display2:'none',
                        judge2:'down'
                    })
                }}>
                    收起更多搜索条件
                </Button>
            )
        }

        let isChecked2 = false
        if(this.state.items2.length!==0 && this.state.items2.length === this.state.selectedRowKeys2.length){
            isChecked2 = true
        }else {
            isChecked2 = false
        }

        return (
            <>
                <Content className="site-layout-background page-content">
                    <Text italic style={{fontSize:20,color:'#666'}}>会话审计</Text>
                    <Tabs type="card" onChange={this.handleOnTabChange} style={{marginTop:20}}>
                        <TabPane tab="实时会话" key="1">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:0}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.onlineFormRef} name="offline" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="created"
                                                label="时间"
                                            >
                                                <RangePicker
                                                    showTime={{ format: 'HH:mm:ss' }}
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    allowEmpty={[true,true]}
                                                    onChange={this.onPickerChange}
                                                />
                                            </Form.Item>
                                            <div style={{display:this.state.display}}>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="userId"
                                                    label="用户"
                                                >
                                                    <Select allowClear placeholder="请选择用户">
                                                        {userOptions}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="clientIp"
                                                    label="来源IP"
                                                >
                                                    <Input type='text' placeholder="来源IP"/>
                                                </Form.Item>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="assetId"
                                                    label="资产名称"
                                                >
                                                    <Select allowClear placeholder="请选择资产名称">
                                                        {assetOptions}
                                                    </Select>
                                                </Form.Item>

                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="protocol"
                                                    label="连接协议"
                                                >
                                                    <Select onChange={null}  placeholder="请选择连接协议">
                                                        <Option value="">全部协议</Option>
                                                        <Option value="rdp">rdp</Option>
                                                        <Option value="ssh">ssh</Option>
                                                        <Option value="vnc">vnc</Option>
                                                        <Option value="telnet">telnet</Option>
                                                        <Option value="kubernetes">kubernetes</Option>
                                                    </Select>
                                                </Form.Item>
                                            </div>

                                            <Form.Item {...formTailLayout} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    搜索
                                                </Button>
                                                { Message }
                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {this.handleExport()}}>
                                                    导出
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}} onClick={() => {
                                                    this.onlineFormRef.current.resetFields();
                                                    this.setState({
                                                        startTime: '',
                                                        endTime: '',
                                                    });
                                                    this.loadTableData({
                                                        pageIndex: 1,
                                                        pageSize: 10,
                                                        userId: undefined,
                                                        assetId: undefined,
                                                    })
                                                }}>重置查询
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Col>
                                    <Col span={10} key={2} style={{textAlign: 'right'}}>
                                    </Col>
                                </Row>
                            </div>

                            <Table
                                rowSelection={rowSelection}
                                dataSource={this.state.items}
                                columns={columns}
                                position={'both'}
                                pagination={{
                                    showSizeChanger: true,
                                    current: this.state.queryParams.pageIndex,
                                    pageSize: this.state.queryParams.pageSize,
                                    onChange: this.handleChangPage,
                                    onShowSizeChange: this.handleChangPage,
                                    total: this.state.total,
                                    showTotal: total => `总计 ${total} 条`
                                }}
                                loading={this.state.loading}
                                bordered
                                size={'small'}
                            />

                            <div style={{margin:'-45px 0px 0 17px'}}>
                                <Checkbox style={{marginRight:17}} onChange={this.selectDataAll} checked={isChecked} />
                                <Button type="primary" danger disabled={!hasSelected}
                                        loading={this.state.delBtnLoading}
                                        onClick={() => {
                                            const content = <div>
                                                您确定要断开选中的<Text style={{color: '#1890FF'}}
                                                               strong>{this.state.selectedRowKeys.length}</Text>个会话吗？
                                            </div>;
                                            confirm({
                                                icon: <ExclamationCircleOutlined/>,
                                                content: content,
                                                onOk: () => {
                                                    this.batchDis()
                                                },
                                                onCancel() {

                                                },
                                            });
                                        }}>批量断开
                                </Button>
                            </div>

                            {
                                this.state.accessVisible ?
                                    <Modal
                                        className='modal-no-padding'
                                        title={this.state.sessionTitle}

                                        maskClosable={false}
                                        visible={this.state.accessVisible}
                                        footer={null}
                                        width={window.innerWidth * 0.8}
                                        height={window.innerWidth * 0.8 / this.state.sessionWidth * this.state.sessionHeight}
                                        onCancel={() => {
                                            message.destroy();
                                            this.setState({accessVisible: false})
                                        }}
                                    >
                                        {
                                            this.state.sessionMode === 'guacd' ?
                                                <AccessMonitor sessionId={this.state.sessionId}
                                                               width={this.state.sessionWidth}
                                                               height={this.state.sessionHeight}
                                                               protocol={this.state.sessionProtocol}
                                                               rate={window.innerWidth * 0.8 / this.state.sessionWidth}>

                                                </AccessMonitor> :
                                                <TermMonitor sessionId={this.state.sessionId}
                                                             width={this.state.sessionWidth}
                                                             height={this.state.sessionHeight}>

                                                </TermMonitor>
                                        }
                                    </Modal> : undefined
                            }
                        </TabPane>
                        <TabPane tab="历史会话" key="2">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:0}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.offlineFormRef} name="offline" layout="horizontal" labelAlign="left" onFinish={this.handleSearch2}>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="created"
                                                label="时间"
                                            >
                                                <RangePicker
                                                    showTime={{ format: 'HH:mm:ss' }}
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    allowEmpty={[true,true]}
                                                    onChange={this.onPickerChange2}
                                                />
                                            </Form.Item>
                                            <div style={{display:this.state.display2}}>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="userId"
                                                    label="用户"
                                                >
                                                    <Select allowClear placeholder="请选择用户">
                                                        {userOptions}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="clientIp"
                                                    label="来源IP"
                                                >
                                                    <Input type='text' placeholder="请输入来源IP" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="reviewed"
                                                    label="是否已阅"
                                                >
                                                    <Select allowClear placeholder="请选择">
                                                        <Option value="">全部</Option>
                                                        <Option value="1">已阅</Option>
                                                        <Option value="0">未阅</Option>
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="assetId"
                                                    label="资产名称"
                                                >
                                                    <Select allowClear placeholder="请选择资产名称">
                                                        {assetOptions}
                                                    </Select>
                                                </Form.Item>

                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="protocol"
                                                    label="连接协议"
                                                >
                                                    <Select allowClear placeholder="请选择连接协议">
                                                        <Option value="">全部协议</Option>
                                                        <Option value="rdp">rdp</Option>
                                                        <Option value="ssh">ssh</Option>
                                                        <Option value="vnc">vnc</Option>
                                                        <Option value="telnet">telnet</Option>
                                                    </Select>
                                                </Form.Item>
                                            </div>

                                            <Form.Item {...formTailLayout} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    搜索
                                                </Button>
                                                { Message2 }
                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {this.handleExport2()}}>
                                                    导出
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}} onClick={() => {
                                                    this.offlineFormRef.current.resetFields();
                                                    this.setState({
                                                        startTime2: '',
                                                        endTime2: '',
                                                    });
                                                    this.loadTableData2({
                                                        pageIndex: 1,
                                                        pageSize: 10,
                                                        userId: undefined,
                                                        assetId: undefined,
                                                    })
                                                }}>重置查询
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Col>
                                    <Col span={10} key={2} style={{textAlign: 'right'}}>
                                        <Space>
                                            <Button
                                                onClick={()=>{window.location.reload();}}>刷新
                                            </Button>

                                            <Button
                                                loading={this.state.reviewedAllBtnLoading}
                                                onClick={this.handleAllReviewed}>全部标为已阅
                                            </Button>

                                            <Button disabled={!hasSelected2}
                                                    loading={this.state.reviewedBtnLoading}
                                                    onClick={this.handleReviewed}>标为已阅
                                            </Button>

                                            <Button disabled={!hasSelected2}
                                                    loading={this.state.unreviewedBtnLoading}
                                                    onClick={this.handleUnreviewed}>标为未阅
                                            </Button>

                                            <Button type="primary" danger
                                                    loading={this.state.clearBtnLoading}
                                                    onClick={() => {
                                                        const content = <Text style={{color: 'red'}}
                                                                              strong>您确定要清空全部的离线会话吗？</Text>;
                                                        confirm({
                                                            icon: <ExclamationCircleOutlined/>,
                                                            content: content,
                                                            okType: 'danger',
                                                            onOk: this.clearSession,
                                                            onCancel() {

                                                            },
                                                        });
                                                    }}>清空
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>

                            <Table
                                rowSelection={rowSelection2}
                                dataSource={this.state.items2}
                                columns={columns2}
                                position={'both'}
                                pagination={{
                                    showSizeChanger: true,
                                    current: this.state.queryParams2.pageIndex,
                                    pageSize: this.state.queryParams2.pageSize,
                                    onChange: this.handleChangPage2,
                                    onShowSizeChange: this.handleChangPage2,
                                    total: this.state.total2,
                                    showTotal: total => `总计 ${total} 条`
                                }}
                                loading={this.state.loading2}
                                bordered
                                size={'small'}
                                rowClassName={(record, index) => {
                                    return (
                                        record.reviewed ? '' : 'rowBackground'
                                    )
                                }}
                            />

                            <div style={{margin:'-45px 0px 0 17px'}}>
                                <Checkbox style={{marginRight:17}} onChange={this.selectDataAll2} checked={isChecked2} />
                                <Button type="primary" danger disabled={!hasSelected2}
                                        loading={this.state.delBtnLoading2}
                                        onClick={() => {
                                            const content = <div>
                                                您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                               strong>{this.state.selectedRowKeys2.length}</Text>条记录吗？
                                            </div>;
                                            confirm({
                                                icon: <ExclamationCircleOutlined/>,
                                                content: content,
                                                onOk: () => {
                                                    this.batchDelete()
                                                },
                                                onCancel() {

                                                },
                                            });
                                        }}>批量删除
                                </Button>
                            </div>

                            {
                                this.state.playbackVisible ?
                                    <Modal
                                        className='modal-no-padding'
                                        title={`会话回放 来源IP：${this.state.selectedRow['clientIp']} 用户昵称：${this.state.selectedRow['creatorName']} 资产名称：${this.state.selectedRow['assetName']} 网络：${this.state.selectedRow['username']}@${this.state.selectedRow['ip']}:${this.state.selectedRow['port']}`}

                                        visible={this.state.playbackVisible}
                                        onCancel={this.hidePlayback}
                                        width={window.innerWidth * 0.8}
                                        footer={null}
                                        destroyOnClose
                                        maskClosable={false}
                                        centered={true}
                                    >
                                        {
                                            this.state.selectedRow['mode'] === 'terminal' || this.state.selectedRow['mode'] === 'naive' ?
                                                <div style={{width:'100%'}}>
                                                    <iframe
                                                        title='recording'
                                                        style={{
                                                            width: '67%',
                                                            overflow: 'visible'
                                                        }}
                                                        onLoad={() => {
                                                        }}
                                                        ref="iframe"
                                                        src={'./asciinema.html?sessionId=' + this.state.selectedRow['id']}
                                                        width="100%"
                                                        height={window.innerHeight * 0.8}
                                                        frameBorder="0"
                                                    />
                                                    <div style={{width:'33%',float:'right'}}>
                                                        <Tabs defaultActiveKey="1" type="card" size='small'>
                                                            <TabPane tab="会话指令" key="1">
                                                                <Table
                                                                    size='small'
                                                                    columns={cmdColumns}
                                                                    dataSource={this.state.cmdItems}
                                                                    pagination={{
                                                                        size:"small",
                                                                        pageSize: 20,
                                                                        total: this.state.cmdTotal,
                                                                        showTotal: total => `总计 ${total} 条`
                                                                    }}
                                                                    scroll={{ y: 370 }}
                                                                    loading={this.state.cmdLoading}
                                                                />
                                                            </TabPane>
                                                        </Tabs>
                                                    </div>
                                                </div>
                                                : <Playback sessionId={this.state.selectedRow['id']}/>
                                        }
                                    </Modal> : undefined
                            }

                        </TabPane>
                    </Tabs>
                </Content>
            </>
        );
    }
}

export default SessionAudit;
