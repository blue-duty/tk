import React, {Component} from 'react';

import {
    Button, Checkbox,
    Col,
    Divider,
    Form,
    Input,
    Layout,
    Modal,
    Row,
    Select,
    Space, Spin, Switch,
    Table,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {ExclamationCircleOutlined,} from '@ant-design/icons';
import SecretStrategyModal from "./SecretStrategyModal";
import {isEmpty} from "../../utils/utils";


const confirm = Modal.confirm;
const {Content} = Layout;
const {Text} = Typography;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class SecretStrategy extends Component {

    secretFormRef = React.createRef();
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
        selectedRow: undefined,
        selectedRowKeys: [],
        changeAssetVisible:false,
        changeAssetConfirmLoading:false,
        allAssetsData:[],
        selectedAssets:[],
        logPending: false,
        logs: []
    };

    componentDidMount() {
        this.loadTableData();
    }

    async delete(id) {
        const result = await request.delete('/encryption/' + id);
        if (result.code === 1) {
            message.success('删除成功');
            this.loadTableData(this.state.queryParams);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }
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
            let result = await request.get('/encryption/paging?' + paramsStr);
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
            'encryptName': values.encryptName,
        }
        this.loadTableData(query)
    }

    showDeleteConfirm(id, content) {
        let self = this;
        confirm({
            title: '您确定要删除此任务吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(id);
            }
        });
    };

    showModal(title, obj = null) {

        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: obj
        });
    };

    handleCancelModal = e => {
        this.setState({
            modalTitle: '',
            modalVisible: false
        });
    };

    handleOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });

        if (formData.id) {
            // 向后台提交数据
            const result = await request.put('/encryption/' + formData.id, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false
                });
                this.loadTableData(this.state.queryParams);
            } else {
                message.error('更新失败: ' + result.message, 10);
            }
        } else {
            // 向后台提交数据
            const result = await request.post('/encryption', formData);
            if (result.code === 1) {
                message.success(result.message);
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

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/encryption/' + this.state.selectedRowKeys.join(','));
            if (result.code === 1) {
                message.success(result.message, 3);
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

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        this.loadTableData(query);
    }

    handleGetAssetName = async () => {
        const result = await request.get('/encryption/asset-relations');
        if (result.code === 1) {
            this.setState({
                allAssetsData:result.data
            })
        } else {
            message.error(result.message);
        }
    }

    handleSearchByAssetName = async (id) => {
        await this.handleGetAssetName()
        const result = await request.get(`/encryption?id=${id}`);
        const items=[]
        if (result.code === 1) {
            result.data.forEach(item => {
                items.push(item.assetId)
            })
            this.setState({
                selectedAssets:items
            })
        } else {
            message.error(result.message);
        }
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

    render() {

        const columns = [{
            title: '计划名称',
            dataIndex: 'encryptName',
            key: 'encryptName',
            sorter: true,
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                return <Switch checkedChildren="开启" unCheckedChildren="关闭" checked={status === 'running'}
                               onChange={async (checked) => {
                                   let encryptStatus = checked ? 'running' : 'not-running';
                                   let result = await request.post(`/encryption/${record['id']}/change-status?status=${encryptStatus}`);
                                   if (result['code'] === 1) {
                                       message.success('操作成功');
                                       await this.loadTableData();
                                   } else {
                                       message.error(result['message']);
                                   }
                               }}
                />
            }
        }, {
            title: '数字',
            dataIndex: 'hasNum',
            key: 'hasNum',
            render: (hasNum, record, index) => {
                if(hasNum===true){
                    return '包含'
                }else {
                    return '不包含'
                }
            }
        }, {
            title: '字母',
            dataIndex: 'hasChar',
            key: 'hasChar',
            render: (hasChar, record, index) => {
                if(hasChar===true){
                    return '包含'
                }else {
                    return '不包含'
                }
            }
        }, {
            title: '特殊字符',
            dataIndex: 'hasSpecial',
            key: 'hasSpecial',
            render: (hasSpecial, record, index) => {
                if(hasSpecial===true){
                    return '包含'
                }else {
                    return '不包含'
                }
            }
        },{
            title: '改密频率（天）',
            dataIndex: 'frequency',
            key: 'frequency',
        }, {
            title: '密码不少于（位）',
            dataIndex: 'length',
            key: 'length',
        },{
            title: '关联资产数',
            dataIndex: 'assetNums',
            key: 'assetNums',
            render:(text, record, index)=>{
                return <Button type="link" size='small'
                               onClick={() => {
                                   this.handleSearchByAssetName(record.id)
                                       .then(() => {
                                           this.setState({
                                               changeAssetVisible: true,
                                               selectedRow: record
                                           })
                                           this.changeAssetFormRef
                                               .current
                                               .setFieldsValue({
                                                   assetIds:this.state.selectedAssets
                                               })
                                       });
                               }}>{text}</Button>
            }
        },{
            title: '最后执行时间',
            dataIndex: 'runTime',
            key: 'runTime',
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text
            },
            sorter: true,
        },{
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small' loading={this.state.items[index]['execLoading']}
                                onClick={async () => {
                                    let items = this.state.items;
                                    items[index]['execLoading'] = true;
                                    this.setState({
                                        items: items
                                    });

                                    let result = await request.post(`/encryption/${record['id']}/exec`);
                                    if (result['code'] === 1) {
                                        message.success(result['message']);
                                        await this.loadTableData();
                                    } else {
                                        message.error(result['message']);
                                        items[index]['execLoading'] = false;
                                        this.setState({
                                            items: items
                                        });
                                    }
                                }}>执行</Button>

                        <Button type="link" size='small'
                                onClick={() => {
                                    this.handleSearchByAssetName(record.id)
                                        .then(() => {
                                            this.setState({
                                                changeAssetVisible: true,
                                                selectedRow: record
                                            })
                                            this.changeAssetFormRef
                                                .current
                                                .setFieldsValue({
                                                    assetIds:this.state.selectedAssets
                                                })
                                        });
                                }}>关联主机</Button>

                        <Button type="link" size='small'
                                onClick={() => this.showModal('编辑改密计划', record)}>编辑</Button>

                        <Button type="link" size='small'
                                onClick={async () => {
                                    this.setState({
                                        logVisible: true,
                                        logPending: true
                                    })

                                    let result = await request.get(`/encryption/${record['id']}/logs`);
                                    if (result['code'] === 1) {
                                        this.setState({
                                            logPending: false,
                                            logs: result['data'],
                                            selectedRow: record
                                        })
                                    }
                                }}>日志</Button>

                        <Button type="text" size='small' danger
                                onClick={() => this.showDeleteConfirm(record.id, record.encryptName)}>删除</Button>
                    </div>
                )
            },
        }
        ];

        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            hideSelectAll:true,
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = selectedRowKeys.length > 0;

        let isChecked = false
        if(this.state.items.length!==0 && this.state.items.length === this.state.selectedRowKeys.length){
            isChecked = true
        }else {
            isChecked = false
        }

        return (
            <>
                <Content className="site-layout-background page-content">

                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>改密计划</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.secretFormRef} name="secretForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="encryptName"
                                        label="计划名称"
                                    >
                                        <Input type='text' placeholder="请输入计划名称" />
                                    </Form.Item>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {
                                                    this.jobFormRef.current.resetFields();
                                                    this.loadTableData({
                                                        pageIndex: 1,
                                                        pageSize: 10,
                                                    })
                                                }}>重置查询
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Col>
                            <Col span={10} key={2} style={{textAlign: 'right'}}>
                                <Space>
                                    <Button type="primary"
                                            onClick={() => this.showModal('新增改密计划',{hasNum: true})}>新增
                                    </Button>

                                    <Button style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => { this.loadTableData(this.state.queryParams)}}>刷新
                                    </Button>
                                </Space>
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
                        onChange={this.handleTableChange}
                        bordered
                        size={'small'}
                    />

                    <div style={{margin:'-45px 0px -6px 17px'}}>
                        <Checkbox style={{marginRight:17}} onChange={this.selectDataAll} checked={isChecked} />
                        <Button type="primary" danger disabled={!hasSelected}
                                loading={this.state.delBtnLoading}
                                onClick={() => {
                                    const content = <div>
                                        您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                       strong>{this.state.selectedRowKeys.length}</Text>条记录吗？
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
                        this.state.modalVisible ?
                            <SecretStrategyModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            >
                            </SecretStrategyModal> : undefined
                    }

                    <Modal title="关联主机" visible={this.state.changeAssetVisible}
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
                                       const result = await request.put(`/encryption/policy-assets?assetIds=${values['assetIds']}&id=${this.state.selectedRow['id']}`);
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
                    </Modal>

                    {
                        this.state.logVisible ?
                            <Modal
                                className='modal-no-padding'
                                width={window.innerWidth * 0.8}
                                title={'日志'}
                                visible={true}
                                maskClosable={false}

                                onOk={async () => {
                                    let result = await request.delete(`/encryption/${this.state.selectedRow['id']}/logs`);
                                    if (result['code'] === 1) {
                                        this.setState({
                                            logVisible: false,
                                            selectedRow: undefined
                                        })
                                        message.success('日志清空成功');
                                    } else {
                                        message.error(result['message'], 10);
                                    }
                                }}
                                onCancel={() => {
                                    this.setState({
                                        logVisible: false,
                                        selectedRow: undefined
                                    })
                                }}
                                okText='清空'
                                okType={'danger'}
                                cancelText='取消'
                                centered={true}
                                cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                            >
                                <Spin tip='加载中...' spinning={this.state.logPending}>
                                    <pre className='cron-log'>
                                        {
                                            this.state.logs.map(item => {
                                                return <><Divider
                                                    orientation="left"
                                                    style={{color: 'white'}}>{item['timestamp']}</Divider>{item['message']}</>;
                                            })
                                        }
                                    </pre>
                                </Spin>
                            </Modal> : undefined
                    }
                </Content>
            </>
        );
    }
}

export default SecretStrategy;
