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
    Space, Switch,
    Table,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, UpOutlined} from '@ant-design/icons';
import WorkOrderApplyModal from "./WorkOrderApplyModal";
import {isEmpty} from "../../utils/utils";
import moment from "moment";


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

class WorkOrderApply extends Component {

    workApplyFormRef = React.createRef();
    changeAssetFormRef = React.createRef()

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        modalVisible: false,
        modalTitle: '',
        modalConfirmLoading: false,
        assets: [],
        model: null,
        allAssetsData:[],
        selectedAssets:[],
        changeAssetVisible: false,
        changeAssetConfirmLoading:false,
        beginTime:'',//开始时间
        endTime:'',  //结束时间
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
            let result = await request.get('/workorder/applicant/paging?' + paramsStr);
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

    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
            'status': values.status,
            "submitStatus":values.submitStatus,
            'beginTime': this.state.beginTime,
            'endTime': this.state.endTime,
        }
        this.loadTableData(query)
    }

    showModal(title, assets = null) {
        let modalData = {
            ...assets,
            'beginTime' : assets['beginTime'] ? moment(assets['beginTime'],"YYYY-MM-DD HH:mm:ss") :undefined,
            'endTime' : assets['beginTime'] ?moment(assets['beginTime'],"YYYY-MM-DD HH:mm:ss") :undefined,
        }
        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: modalData
        });
    };

    handleCancelModal = e => {
        this.setState({
            modalTitle: '',
            modalVisible: false
        });
    };

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        this.loadTableData(query);
    }

    handleOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });

        if (formData.id) {
            // 向后台提交数据
            const result = await request.put('/workorder/' + formData.id, formData);
            if (result.code === 1) {
                message.success('更新成功');

                this.setState({
                    modalVisible: false
                });
                this.loadTableData(this.state.queryParams);
            } else {
                message.error('更新失败: ' + result.message, 10);
            }
        } else {
            // 向后台提交数据
            const result = await request.post('/workorder/apply', formData);
            if (result.code === 1) {
                message.success('新增成功');

                this.setState({
                    modalVisible: false
                });
                this.loadTableData(this.state.queryParams);
            } else {
                message.error('新增失败: ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    handleGetAssets = async () => {
        const result = await request.get('/workorder/all-assets');
        if (result.code === 1) {
            this.setState({
                allAssetsData:result.data
            })
        } else {
            message.error(result.message);
        }
    }

    handleByAsset = async (record) => {
        await this.handleGetAssets()
        const result = await request.get(`/workorder/related-asset/${record.id}`);
        const items=[]
        if (result.code === 1) {
            result.data = result.data ?result.data :[]
            result.data.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedAssets:items
            })
        } else {
            message.error(result.message);
        }
    }


    render() {

        const columns = [{
            title: '工单名称',
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
        }, {
            title: '审批状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                return text
            },
            sorter: true,
        }, {
            title: '审批人',
            dataIndex: 'approverName',
            key: 'approverName',
            render: (text, record) => {
                return text
            },
            sorter: true,
        }, {
            title: '审批时间',
            dataIndex: 'approveTime',
            key: 'approveTime',
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
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
                let submitStatus= record.submitStatus
                if(submitStatus==='已提交'){
                    submitStatus = true
                }else {
                    submitStatus = false
                }

                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={() => this.showModal('更新工单', record)}>编辑</Button>

                        <Button type="link" size='small' onClick={async () => {
                            this.setState({
                                changeAssetVisible: true,
                                selectedRow: record
                            })
                            this.handleByAsset(record)
                                .then(() => {
                                    this.changeAssetFormRef
                                        .current
                                        .setFieldsValue({
                                            assetIds:this.state.selectedAssets
                                        })
                                });
                        }}>关联主机</Button>

                        <Switch size="small" checkedChildren="提交" unCheckedChildren="撤销" checked={submitStatus}
                                onChange={async (checked) => {
                                    let result = await request.post(`/workorder/${record['id']}/submit?submitStatus=${checked}`);
                                    if (result['code'] === 1) {
                                        message.success(result['message']);
                                        await this.loadTableData();
                                    } else {
                                        message.error(result['message']);
                                    }
                                }}
                        />
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


        return (
            <>
                <Content className="site-layout-background page-content">

                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>工单申请</Text>
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
                                            label="工单名称"
                                        >
                                            <Input type='text' placeholder="工单名称"/>
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            name="submitStatus"
                                            label="提交状态"
                                        >
                                            <Select onChange={null}  placeholder="请选择提交状态">
                                                <Option value="已提交">已提交</Option>
                                                <Option value="未提交">未提交</Option>
                                            </Select>
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
                                    <Button type="primary"
                                            onClick={() => this.showModal('添加工单申请', {})}>新增
                                    </Button>

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
                        this.state.modalVisible ?
                            <WorkOrderApplyModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            >
                            </WorkOrderApplyModal>
                            : null
                    }

                    {
                        this.state.changeAssetVisible?
                            <Modal title={<Text>关联主机「<strong>{this.state.selectedRow['name']}</strong>」</Text>}
                                   visible={this.state.changeAssetVisible}
                                   confirmLoading={this.state.changeAssetConfirmLoading}
                                   maskClosable={false}
                                   onOk={() => {
                                       this.setState({
                                           changeAssetConfirmLoading: true
                                       });

                                       this.changeAssetFormRef.current
                                           .validateFields()
                                           .then(async values => {
                                               if (values['assetIds']) {
                                                   values['assetIds'] = values['assetIds'].join(',');
                                               }
                                               const result = await request.post(`workorder/related-asset?assetId=${values['assetIds']}&workOrderId=${this.state.selectedRow['id']}`);
                                               if (result.code === 1) {
                                                   message.success('操作成功');
                                                   await this.loadTableData(this.state.queryParams);
                                               } else {
                                                   message.error( result.message, 10);
                                                   this.setState({
                                                       changeAssetVisible: false
                                                   });
                                               }

                                           })
                                           .catch(info => {

                                           })
                                           .finally(() => {
                                               this.setState({
                                                   changeAssetVisible: false,
                                                   changeAssetConfirmLoading: false
                                               })
                                           });
                                   }}
                                   onCancel={() => {
                                       this.setState({
                                           changeAssetVisible: false
                                       })
                                   }}>

                                <Form ref={this.changeAssetFormRef}>

                                    <Form.Item label="关联主机" name='assetIds'>
                                        <Select
                                            mode="multiple"
                                            allowClear
                                            style={{ width: '100%' }}
                                            placeholder="请选择关联主机"
                                        >
                                            {this.state.allAssetsData.map(d => <Select.Option key={d.id}
                                                                                              value={d.id}>{d.name}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Form>
                            </Modal>:undefined
                    }


                </Content>
            </>
        );
    }
}

export default WorkOrderApply;
