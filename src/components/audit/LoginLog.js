import React, {Component} from 'react';

import {
    Button,
    Col,
    Divider, Form,
    Input,
    Layout,
    Row,
    Select,
    Table,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {download, formatDate, getToken, isEmpty} from "../../utils/utils";
import {message} from "antd/es";
import {DownOutlined,UpOutlined} from "@ant-design/icons";
import {server} from "../../common/env";


const {Content} = Layout;
const {Text} = Typography;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class LoginLog extends Component {

    loginFormRef = React.createRef();

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
        users: [],
        clientIp:'',
        userId:'',
        display:'none',
        judge:'down',
    };

    componentDidMount() {
        this.loadTableData();
        this.handleSearchByUsername('');
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
            let result = await request.get('/login-logs/paging?' + paramsStr);
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

    //搜索
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'userId': values.userId,
            'clientIp': values.clientIp,
        }
        this.setState({
            userId: values.userId,
            clientIp: values.clientIp,
        })
        this.loadTableData(query)
    }

    //导出
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'clientIp': this.state.clientIp,
            'userId': this.state.userId,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}/login-logs/export?${queryStr}`);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/login-logs/' + this.state.selectedRowKeys.join(','));
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
            title: '用户账号',
            dataIndex: 'userName',
            key: 'userName'
        }, {
            title: '来源IP',
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: '浏览器',
            dataIndex: 'clientUserAgent',
            key: 'clientUserAgent',
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
        }, {
            title: '登录时间',
            dataIndex: 'loginTime',
            key: 'loginTime',
            render: (text, record) => {

                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        }, {
            title: '注销时间',
            dataIndex: 'logoutTime',
            key: 'logoutTime',
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            }
        },{
            title: '登录结果',
            dataIndex: 'loginResult',
            key: 'loginResult'
        }
        ];

        const userOptions = this.state.users.map(d => <Select.Option key={d.id}
                                                                     value={d.id}>{d.username}</Select.Option>);

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
                        <Text italic style={{fontSize:20,color:'#666'}}>登录日志</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.loginFormRef} name="loginForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="userId"
                                        label="用户账号"
                                    >
                                        <Select
                                            placeholder='选择用户账号'
                                            filterOption={false}
                                            allowClear
                                        >
                                            {userOptions}
                                        </Select>
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="clientIp"
                                            label="来源IP"
                                        >
                                            <Input type='text' placeholder="请输入来源IP" />
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

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {
                                                    this.loginFormRef.current.resetFields();
                                                    this.loadTableData({
                                                        pageIndex: 1,
                                                        pageSize: 10,
                                                        protocol: '',
                                                        userId: undefined,
                                                        assetId: undefined
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

export default LoginLog;
