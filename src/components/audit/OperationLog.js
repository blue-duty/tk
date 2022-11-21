import React, {Component} from 'react';

import {
    Form,
    DatePicker,
    Button,
    Col,
    Input,
    Layout,
    Row,
    Select,
    Table,
    Tooltip,
    Typography, Divider
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {isEmpty, download, getToken} from "../../utils/utils";
import {message} from "antd/es";
import {DownOutlined, UpOutlined } from "@ant-design/icons";
import "./OperationLog.css"
import {server} from "../../common/env";

const {Content} = Layout;
const { Option } = Select;
const {Text} = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class OperationLog extends Component {

    operaFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            userId: undefined,
        },
        loading: false,
        selectedRowKeys: [],
        delBtnLoading: false,
        display:'none',
        judge:'down',
        users: '',
        ip: '',
        logTypes: '',
        logContents:'',
        result: '',
        startTime:'',//开始时间
        endTime:'',  //结束时间
    };

    componentDidMount() {
        this.loadTableData();
    }

    async loadTableData(queryParams) {
        queryParams = queryParams || this.state.queryParams;

        this.setState({
            queryParams: queryParams,
            loading: true
        });

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/operate-logs/paging?' + paramsStr);
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
            'users': values.users,
            'ip': values.ip,
            'logTypes': values.logTypes,
            'logContents': values.logContents,
            'result': values.result,
            'beginTime': this.state.startTime,
            'endTime': this.state.endTime,
        }
        this.setState({
            users: values.users,
            ip: values.ip,
            logTypes: values.logTypes,
            logContents: values.logContents,
            result: values.result,
        })
        this.loadTableData(query)
    }

    //导出
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'users': this.state.users,
            'ip': this.state.ip,
            'logTypes': this.state.logTypes,
            'logContents': this.state.logContents,
            'result': this.state.result,
            'beginTime': this.state.startTime,
            'endTime': this.state.endTime,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}/operate-logs/export?${queryStr}`);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/operate-logs/' + this.state.selectedRowKeys.join(','));
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

    render() {

        const columns = [{
            title: '用户',
            dataIndex: 'users',
            key: 'users',
            width:130
        }, {
            title: '来源IP',
            dataIndex: 'ip',
            key: 'ip',
            width:150
        }, {
            title: '浏览器',
            dataIndex: 'clientUserAgent',
            key: 'clientUserAgent',
            width:117,
            render: (text, record) => {
                if (isEmpty(text)) {
                    return '未知';
                }
                return (
                    <Tooltip placement="topLeft" title={text}>
                        {text.split(' ')[0]}
                    </Tooltip>
                )
            }
        },{
            title: '日志类型',
            dataIndex: 'logTypes',
            key: 'logTypes',
            width:135
        },{
            title: '日志内容',
            dataIndex: 'logContents',
            key: 'logContents',
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        },{
            title: '时间',
            dataIndex: 'created',
            key: 'created',
            width:200,
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            }
        },{
            title: '结果',
            dataIndex: 'result',
            key: 'result',
            width:80
        }
        ];

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

        return (
            <>
                <Content className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>操作日志</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.operaFormRef} name="opera" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
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
                                            name="users"
                                            label="用户"
                                        >
                                            <Input type='text' placeholder="请输入用户"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="ip"
                                            label="来源IP"
                                        >
                                            <Input type='text' placeholder="来源IP"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="logTypes"
                                            label="日志类型"
                                        >
                                            <Select onChange={null}>
                                                <Option value="">全部</Option>
                                                <Option value="资产日志">资产日志</Option>
                                                <Option value="用户日志">用户日志</Option>
                                                <Option value="运维日志">运维日志</Option>
                                                <Option value="审计日志">审计日志</Option>
                                                <Option value="策略日志">策略日志</Option>
                                                <Option value="配置日志">配置日志</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="logContents"
                                            label="日志内容"
                                        >
                                            <TextArea placeholder="请输入日志内容" autoSize />
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            name="result"
                                            label="结果"
                                        >
                                            <Select onChange={null}>
                                                <Option value="">全部</Option>
                                                <Option value="成功">成功</Option>
                                                <Option value="失败">失败</Option>
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
                                            this.operaFormRef.current.resetFields();
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
                            <Col span={10} key={2}>
                            </Col>
                        </Row>
                    </div>

                    <Table
                           dataSource={this.state.items}
                           columns={columns}
                           position={'both'}
                           pagination={{
                               showSizeChanger: true,
                               current: this.state.queryParams.pageIndex,
                               pageSize: this.state.queryParams.pageSize,
                               onChange: this.handleChangPage,
                               total: this.state.total,
                               showTotal: total => `总计 ${total} 条`
                           }}
                           loading={this.state.loading}
                           bordered
                           size={'small'}
                    />
                </Content>
            </>
        );
    }
}

export default OperationLog;
