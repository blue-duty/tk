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

    //??????
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

    //??????
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'clientIp': this.state.clientIp,
            'userId': this.state.userId,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //??????????????????
        download(`${server}/login-logs/export?${queryStr}`);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/login-logs/' + this.state.selectedRowKeys.join(','));
            if (result.code === 1) {
                message.success('????????????', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('????????????: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    render() {

        const columns = [{
            title: '????????????',
            dataIndex: 'userName',
            key: 'userName'
        }, {
            title: '??????IP',
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: '?????????',
            dataIndex: 'clientUserAgent',
            key: 'clientUserAgent',
            render: (text, record) => {
                if (isEmpty(text)) {
                    return '??????';
                }
                return (
                    <Tooltip placement="topLeft" title={text}>
                        {text.split(' ')[0]}
                    </Tooltip>
                )
            }
        }, {
            title: '????????????',
            dataIndex: 'loginTime',
            key: 'loginTime',
            render: (text, record) => {

                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        }, {
            title: '????????????',
            dataIndex: 'logoutTime',
            key: 'logoutTime',
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            }
        },{
            title: '????????????',
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
                        }}>????????????????????????
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
                    ????????????????????????
                </Button>
            )
        }

        return (
            <>
                <Content className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>????????????</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.loginFormRef} name="loginForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="userId"
                                        label="????????????"
                                    >
                                        <Select
                                            placeholder='??????????????????'
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
                                            label="??????IP"
                                        >
                                            <Input type='text' placeholder="???????????????IP" />
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            ??????
                                        </Button>
                                        { Message }
                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {this.handleExport()}}>
                                            ??????
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
                                                }}>????????????
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
                               showTotal: total => `?????? ${total} ???`
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
