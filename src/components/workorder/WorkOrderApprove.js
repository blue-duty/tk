import React, {Component} from 'react';

import {
    Button,
    Col, DatePicker,
    Divider,
    Form,
    Input,
    Layout,
    Modal,
    Row,
    Select,
    Space,
    Table, Tag,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, UpOutlined} from '@ant-design/icons';
import {isEmpty} from "../../utils/utils";
import {PROTOCOL_COLORS} from "../../common/constants";


const {Content} = Layout;
const {Text} = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class WorkOrderApprove extends Component {

    workApplyFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        beginTime:'',//开始时间
        endTime:'',  //结束时间
        display:'none',
        judge:'down',
        detailVisible:false,
        detailPending: false,
        selectedRow:{},
        details:[]
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
            let result = await request.get('/workorder/approval/paging?' + paramsStr);
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

    handleChangPage = async (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        await this.loadTableData(queryParams)
    };

    //搜索
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
            'status': values.status,
            'beginTime': this.state.beginTime,
            'endTime': this.state.endTime,
        }
        this.loadTableData(query)
    }

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        this.loadTableData(query);
    }


    render() {

        const columns = [{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                return (
                    <Button type="link" size='small'
                            onClick={() => this.showModal('更新工单',  record)}>{name}</Button>
                );
            },
            sorter: true,
        },{
            title: '申请人',
            dataIndex: 'applicant',
            key: 'applicant',
            render: (text, record) => {
                return text
            },
            sorter: true,
        }, {
            title: '申请资产',
            dataIndex: 'assetName',
            key: 'assetName',
            sorter: true,
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        }, {
            title: '创建时间',
            dataIndex: 'beginTime',
            key: 'beginTime',
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            },
            sorter: true,
        }, {
            title: '结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            },
            sorter: true,
        },{
            title: '审批人',
            dataIndex: 'approverName',
            key: 'approverName',
            render: (text, record) => {
                return text
            },
            sorter: true,
        }, {
            title: '审批状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                return text
            },
            sorter: true,
        }, {
            title: '描述',
            dataIndex: 'describe',
            key: 'describe',
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => {

                return (
                    <div>
                        <Button type="link" size='small' onClick={async ()=>{
                            this.setState({
                                detailVisible:true,
                                detailPending: true
                            })

                            let result = await request.get(`/workorder/details/${record.id}`);
                            if (result['code'] === 1) {
                                result.data = result.data ?result.data :[]
                                const items = result.data.map(item => {
                                    return {'key': item['id'], ...item}
                                })
                                this.setState({
                                    detailPending: false,
                                    details: items,
                                    selectedRow: record
                                })
                            }

                        }}>详情</Button>


                        <Button type="link" size='small' disabled={!(record.status!=='已驳回')} onClick={ async () =>{
                            let result = await request.post(`/workorder/approve?workOrderId=${record.id}&describe=${record.describe}`);
                            if (result['code'] === 1) {
                                message.success(result['message']);
                                await this.loadTableData();
                            } else {
                                message.error(result['message']);
                            }
                        }}>通过</Button>

                        <Button type="link" size='small' onClick={ async () =>{
                            let result = await request.post(`/workorder/reject?workOrderId=${record.id}&describe=${record.describe}`);
                            if (result['code'] === 1) {
                                message.success(result['message']);
                                await this.loadTableData();
                            } else {
                                message.error(result['message']);
                            }
                        }}>驳回</Button>

                        <Button type="link" size='small' disabled={!(record.status!=='已驳回')} onClick={ async () =>{
                            let result = await request.delete(`/workorder/${record.id}/revoke-approve`);
                            if (result['code'] === 1) {
                                message.success(result['message']);
                                await this.loadTableData();
                            } else {
                                message.error(result['message']);
                            }
                        }}>撤销通过</Button>
                    </div>
                )
            },
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

        const columns3 = [{
            title: '主机名称',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        }, {
            title: '连接协议',
            dataIndex: 'protocol',
            key: 'protocol',
            render: (text, record) => {
                const title = `${record['ip'] + ':' + record['port']}`
                return (
                    <Tooltip title={title}>
                        <Tag color={PROTOCOL_COLORS[text]}>{text}</Tag>
                    </Tooltip>
                )
            }
        },  {
            title: '所有者',
            dataIndex: 'ownerName',
            key: 'ownerName'
        }, {
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },
        ];


        return (
            <>
                <Content className="site-layout-background page-content">

                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>工单审批</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.workApplyFormRef} name="workApplyForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
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
                                            name="name"
                                            label="名称"
                                        >
                                            <Input type='text' placeholder="工单名称"/>
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            name="status"
                                            label="审批状态"
                                        >
                                            <Select onChange={null}  placeholder="请选择连接协议">
                                                <Option value="待审批">待审批</Option>
                                                <Option value="已通过">已通过</Option>
                                                <Option value="已驳回">已驳回</Option>
                                                <Option value="已过期">已过期</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>
                                        { Message }

                                        <Button style={{backgroundColor:'#F7F7F7'}} onClick={() => {
                                            this.workApplyFormRef.current.resetFields();
                                            this.setState({
                                                beginTime: '',
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
                                <Space>
                                    <Button style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => { this.loadTableData(this.state.queryParams)}}>刷新
                                    </Button>
                                </Space>
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
                            onShowSizeChange: this.handleChangPage,
                            total: this.state.total,
                            showTotal: total => `总计 ${total} 条`
                        }}
                        loading={this.state.loading}
                        onChange={this.handleTableChange}
                        bordered
                        size={'small'}
                    />

                    {
                        this.state.detailVisible?
                            <Modal title={<Text>详情「<strong>{this.state.selectedRow['name']}</strong>」</Text>}
                                   visible={this.state.detailVisible}
                                   maskClosable={false}
                                   footer={null}
                                   width='800px'
                                   centered={true}
                                   onCancel={() => {
                                       this.setState({
                                           detailVisible: false
                                       })
                                   }}>
                                <Table
                                    dataSource={this.state.details}
                                    columns={columns3}
                                    position={'both'}
                                    scroll={{y:500}}
                                    loading={this.state.detailPending}
                                    pagination={{
                                        hideOnSinglePage:true
                                    }}
                                    bordered
                                    size={'small'}
                                />
                            </Modal>:undefined
                    }


                </Content>
            </>
        );
    }
}

export default WorkOrderApprove;
