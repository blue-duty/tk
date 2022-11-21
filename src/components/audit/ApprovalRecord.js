import React, {Component} from 'react';

import {
    Button,
    Col, DatePicker, Divider,
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
import { download, getToken} from "../../utils/utils";
import {message} from "antd/es";
import {DownOutlined, UpOutlined} from "@ant-design/icons";
import {server} from "../../common/env";

const {Content} = Layout;
const {Text} = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class ApprovalRecord extends Component {

    recordFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
        },
        loading: false,
        display:'none',
        judge:'down',
        startTime:'',//开始时间
        endTime:'',  //结束时间
    };

    componentDidMount() {
        this.loadTableData();
    }

    async loadTableData(queryParams) {
        this.setState({
            loading: true
        });

        queryParams = queryParams || this.state.queryParams;
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/workorder/logpaging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items ? data.items : []
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
            'applicant': values.applicant,
            'approved': values.approved,
            'ip': values.ip,
            'asset': values.asset,
            'status': values.status,
            "applicationType":values.applicationType,
            'beginTime': this.state.startTime,
            'endTime': this.state.endTime,
        }
        this.setState({
            applicant: values.applicant,
            approved: values.approved,
            ip: values.ip,
            asset: values.asset,
            status: values.status,
            applicationType:values.applicationType
        })
        this.loadTableData(query)
    }

    //导出
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'applicant': this.state.applicant,
            'ip': this.state.ip,
            'asset': this.state.asset,
            'approved': this.state.approved,
            'status':this.state.status,
            "applicationType":this.state.applicationType,
            'beginTime': this.state.startTime,
            'endTime': this.state.endTime,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}workorder/export?${queryStr}`);
    }


    render() {

        const columns = [{
            title: '主机名称',
            dataIndex: 'asset',
            key: 'asset'
        }, {
            title: '来源IP',
            dataIndex: 'ip',
            key: 'ip'
        }, {
            title: '申请用户',
            dataIndex: 'applicant',
            key: 'applicant'
        },  {
            title: '申请类型',
            dataIndex: 'applicationType',
            key: 'applicationType'
        }, {
            title: '审批人',
            dataIndex: 'approved',
            key: 'approved',
            render: (text, record) => {
                return text
            }
        }, {
            title: '申请时间',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            }
        }, {
            title: '审批时间',
            dataIndex: 'approveTime',
            key: 'approveTime',
            render: (text, record) => {
                return text
            }
        },{
            title: '详情',
            dataIndex: 'information',
            key: 'information'
        },  {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
        }
        ];

        const applicantOptions = this.state.items.map(d => <Select.Option key={d.id}
                                                                     value={d.applicant}>{d.applicant}</Select.Option>);
        const approvedOptions = this.state.items.map(d => <Select.Option key={d.id}
                                                                          value={d.approved}>{d.approved}</Select.Option>);
        const assetOptions = this.state.items.map(d => <Select.Option key={d.id}
                                                                       value={d.asset}>{d.asset}</Select.Option>);
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
                        <Text italic style={{fontSize:20,color:'#666'}}>审批日志</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.recordFormRef} name="offline" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
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
                                            name="ip"
                                            label="来源IP"
                                        >
                                            <Input type='text' placeholder="来源IP"/>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="applicant"
                                            label="申请人"
                                        >
                                            <Select allowClear placeholder="请选择用户">
                                                {applicantOptions}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="approved"
                                            label="审批人"
                                        >
                                            <Select allowClear placeholder="请选择用户">
                                                {approvedOptions}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="asset"
                                            label="资产名称"
                                        >
                                            <Select allowClear placeholder="请选择资产名称">
                                                {assetOptions}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            name="status"
                                            label="状态"
                                        >
                                            <Select onChange={null}  placeholder="请选择连接协议">
                                                <Option value="已取消">已取消</Option>
                                                <Option value="已通过">已通过</Option>
                                                <Option value="已驳回">已驳回</Option>
                                                <Option value="已超时">已超时</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            name="applicationType"
                                            label="审批类型"
                                        >
                                            <Select onChange={null}  placeholder="请选择审批类型">
                                                <Option value="工单审批">工单审批</Option>
                                                <Option value="命令审批">命令审批</Option>
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
                                            this.recordFormRef.current.resetFields();
                                            this.setState({
                                                startTime: '',
                                                endTime: '',
                                            });
                                            this.loadTableData({
                                                pageIndex: 1,
                                                pageSize: 10,
                                                applicantId: undefined,
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

                    <Table dataSource={this.state.items}
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

export default ApprovalRecord;
