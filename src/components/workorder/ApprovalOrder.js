import React, {Component} from 'react';

import {
    Button,
    Col, Divider,
    Form,
    Input,
    Layout,
    Row,
    Select,
    Table,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, UpOutlined} from "@ant-design/icons";

const {Content} = Layout;
const {Text} = Typography;
const formItemLayout = {
    labelCol: {span: 2},
    wrapperCol: {span: 12},
};
const formTailLayout = {
    wrapperCol:{ offset: 2, span:14 }
};

class ApprovalOrder extends Component {

    orderFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
        },
        loading: false,
        execLoading:false,
        forbidLoading:false,
        display:'none',
        judge:'down',
    };

    componentDidMount() {
        this.loadTableData();
    }

    async loadTableData(queryParams) {
        this.setState({
            loading: true
        });

        queryParams = queryParams || this.state.queryParams;

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/workorder/paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items ?data.items : []
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

    //??????
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'applicant': values.applicantId,
            'ip': values.ip,
            'asset': values.assetId,
        }
        this.setState({
            applicantId: values.applicantId,
            ip: values.ip,
            assetId: values.assetId,
        })
        this.loadTableData(query)
    }


    render() {

        const columns = [{
            title: '??????IP',
            dataIndex: 'ip',
            key: 'ip'
        }, {
            title: '??????',
            dataIndex: 'asset',
            key: 'asset'
        },{
            title: '??????',
            dataIndex: 'command',
            key: 'command',
        }, {
            title: '????????????',
            dataIndex: 'applicant',
            key: 'applicant'
        },{
            title: '????????????',
            dataIndex: 'time',
            key: 'time',
            render: (text, record) => {
                return text
            }
        },
            {
                title: '??????',
                key: 'action',
                render: (text, record) => {
                    return (
                        <div>
                            <Button type="link" size='small' loading={this.state.execLoading}
                                    onClick={ async () => {
                                        let status = "true"
                                        this.setState({ execLoading: true});
                                        let result = await request.put(`/workorder/${record['id']}/command?status=${status}`);
                                        if (result['code'] === 1) {
                                            message.success("??????"+result['message']);
                                            await this.loadTableData()
                                            this.setState({
                                                execLoading: false
                                            });
                                        } else {
                                            message.error(result['message']);
                                            this.setState({
                                                execLoading: false
                                            });
                                        }
                                    }}>??????</Button>
                            <Button type="link" size='small' loading={this.state.forbidLoading}
                                    onClick={async () => {
                                        let status = "false"
                                        this.setState({
                                            forbidLoading: true
                                        });
                                        let result = await request.put(`/workorder/${record['id']}/command?status=${status}`);
                                        if (result['code'] === 1) {
                                            message.success("????????????"+result['message']);
                                            await this.loadTableData()
                                            this.setState({
                                                forbidLoading: false
                                            });
                                        } else {
                                            message.error(result['message']);
                                            this.setState({
                                                forbidLoading: false
                                            });
                                        }
                                    }}>??????</Button>
                        </div>
                    )
                },
            }
        ];

        const userOptions = this.state.items.map(d => <Select.Option key={d.id}
                                                                     value={d.applicant}>{d.applicant}</Select.Option>);
        const assetOptions = this.state.items.map(d => <Select.Option key={d.id}
                                                                       value={d.asset}>{d.asset}</Select.Option>);
        let Message
        if (this.state.judge ==='down') {
            Message = (
                <Button icon={<DownOutlined />} onClick={() => {
                    this.setState({
                        display:'block',
                        judge:'up'
                    })
                }}>
                    ????????????????????????
                </Button>
            )
        } else {
            Message = (
                <Button icon={<UpOutlined />} onClick={() => {
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
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'20px 0 10px 0'}}>
                            <Col span={20} key={1}>
                                <Form ref={this.orderFormRef} name="offline" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="applicantId"
                                        label="??????"
                                    >
                                        <Select allowClear placeholder="???????????????">
                                            {userOptions}
                                        </Select>
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="ip"
                                            label="??????IP"
                                        >
                                            <Input type='text' placeholder="??????IP"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="assetId"
                                            label="????????????"
                                        >
                                            <Select allowClear placeholder="?????????????????????">
                                                {assetOptions}
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            ??????
                                        </Button>
                                        { Message }

                                        <Button style={{backgroundColor:'#F7F7F7 '}} onClick={() => {
                                            this.orderFormRef.current.resetFields();
                                            this.loadTableData({
                                                pageIndex: 1,
                                                pageSize: 10,
                                                applicantId: undefined,
                                                assetId: undefined,
                                            })
                                        }}>????????????
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Col>
                            <Col span={4} key={2}>
                            </Col>
                        </Row>
                    </div>

                    <Table dataSource={this.state.items}
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

export default ApprovalOrder;
