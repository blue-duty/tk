import React, {Component} from 'react';

import {
    Badge,
    Button, Checkbox,
    Col,
    Divider,
    Form,
    Input,
    Layout,
    Modal,
    Row, Select,
    Space,
    Table, Tag,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {PROTOCOL_COLORS} from "../../common/constants";
import { isEmpty} from "../../utils/utils";
import AssetGroupModal from "./AssetGroupModal";
import {hasPermission, isAdmin} from "../../service/permission";


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

class AssetGroup extends Component {

    assetGroupFormRef = React.createRef();
    changeOwnerFormRef = React.createRef();
    changeAssetFormRef = React.createRef()

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
        },
        loading: false,
        modalVisible: false,
        modalTitle: '',
        modalConfirmLoading: false,
        selectedTags: [],
        model: {},
        selectedRowKeys: [],
        delBtnLoading: false,
        currentRow:{},
        changeOwnerModalVisible: false,
        changeOwnerConfirmLoading: false,
        fileList: [],
        uploading: false,
        users:[],
        //表2
        tabModalVisible:false,
        items3: [],
        loading3: false,
        changeAssetVisible:false,
        changeAssetConfirmLoading:false,
        allAssetsData:[],
        selectedAssets:[],
    };

    async componentDidMount() {

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
            let result = await request.get('/assetgroup/paging?' + paramsStr);
            if (result['code'] === 1) {
                data = result['data'];
            } else {
                message.error(result['message']);
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

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        this.loadTableData(query);
    }
    //搜索
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
        }
        this.setState({
            'name': values.name,
        })
        this.loadTableData(query)
    }

    async delete(id) {
        const result = await request.delete('/assetgroup/' + id);
        if (result['code'] === 1) {
            message.success('删除成功');
            await this.loadTableData(this.state.queryParams);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }

    }

    showDeleteConfirm(record) {
        let self = this;
        confirm({
            title: '您确定要删除此项吗?',
            content: record.name,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(record.id);
            }
        });
    };

    async showModal(title, asset = {}) {
        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: asset
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
            const result = await request.put('/assetgroup/' + formData.id, formData);
            if (result.code === 1) {
                message.success('操作成功', 3);

                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('操作失败: ' + result.message, 10);
            }
        } else {
            // 向后台提交数据
            const result = await request.post('/assetgroup', formData);
            if (result.code === 1) {
                message.success('操作成功', 3);
                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('操作失败: ' + result.message, 10);
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
            let result = await request.delete('/assetgroup/' + this.state.selectedRowKeys.join(','));
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

    handleGetName= async () =>{
        const result = await request.get(`/users/paging?pageIndex=1&pageSize=100`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }

        const items = result['data']['items'].map(item => {
            return {'key': item['id'], ...item}
        })

        this.setState({
            users: items
        })

    }


    //第2个页面
    async loadTableData3(id) {
        this.setState({
            loading3: true
        });

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get(`/assetgroup/${id}`);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items ?data.items :[]
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items3: items,
                loading3: false
            });
        }
    }

    handleGetAssetName = async () => {
        const result = await request.get('/assets/paging?pageIndex=1&pageSize=100');
        if (result.code === 1) {
            this.setState({
                allAssetsData:result.data.items
            })
        } else {
            message.error(result.message);
        }
    }

    handleSearchByAssetName = async (id) => {
        await this.handleGetAssetName()
        const result = await request.get(`/assetgroup/${id}`);
        const items=[]
        if (result.code === 1) {
            result.data.items = result.data.items ?result.data.items :[]
            result.data.items.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedAssets:items
            })
        } else {
            message.error(result.message);
        }
    }

    access = async (record) => {
        const id = record['id'];
        const protocol = record['protocol'];
        const name = record['name'];
        const sshMode = record['sshMode'];

        message.loading({content: '正在检测主机是否在线...', key: id});
        let result = await request.post(`/assets/${id}/tcping`);
        if (result.code === 1) {
            if (result.data === true) {
                message.success({content: '检测完成，您访问的主机在线，即将打开窗口进行访问。', key: id, duration: 3});
                if (protocol === 'ssh' && (sshMode === 'native' || sshMode === 'naive')){
                    window.open(`#/term?assetId=${id}&assetName=${name}`);
                } else {
                    window.open(`#/access?assetId=${id}&assetName=${name}&protocol=${protocol}`);
                }
            } else {
                message.warn({content: '您访问的主机未在线，请确认网络状态。', key: id, duration: 10});
            }
        } else {
            message.error({content: result.message, key: id, duration: 10});
        }

    }


    render() {

        const columns = [{
            title: '主机组名称',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                if (hasPermission(record['ownerId'])) {
                    return (
                        <Button type="link" size='small'
                                onClick={() => this.showModal('更新主机组', record)}>{name}</Button>
                    );
                }else{
                    return name
                }
            },
            sorter: true,
        }, {
            title: '主机数',
            dataIndex: 'count',
            key: 'count',
        }, {
            title: '所有者',
            dataIndex: 'owner',
            key: 'owner',
        },{
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },{
            title: '描述',
            dataIndex: 'info',
            key: 'info',
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
                        <Button type="link" size='small'
                                onClick={async () =>{
                                    await this.loadTableData3(record.id)
                                    this.setState({
                                        tabModalVisible : true,
                                        currentRow : record
                                    })
                                }}>主机列表</Button>

                        <Button type="link" size='small' disabled={!hasPermission(record['ownerId'])}
                                onClick={() => this.showModal('编辑主机组',record)}>编辑</Button>
                        {
                            isAdmin() ?
                                <Button type="link" size='small' disabled={!hasPermission(record['ownerId'])}
                                        onClick={() => {
                                            this.handleGetName('')
                                                .then(() => {
                                                    this.setState({
                                                        changeOwnerModalVisible: true,
                                                        currentRow : record,
                                                    })
                                                    this.changeOwnerFormRef
                                                        .current
                                                        .setFieldsValue({
                                                            owner: record['ownerId']
                                                        })
                                                });
                                        }}>更换所有者</Button>: undefined
                        }

                        <Button type="text" size='small' danger disabled={!hasPermission(record['ownerId'])}
                                onClick={() => this.showDeleteConfirm(record)}>删除</Button>

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
        }, {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            render: tags => {
                if (!isEmpty(tags)) {
                    let tagDocuments = []
                    let tagArr = tags.split(',');
                    for (let i = 0; i < tagArr.length; i++) {
                        if (tags[i] === '-') {
                            continue;
                        }
                        tagDocuments.push(<Tag key={tagArr[i]}>{tagArr[i]}</Tag>)
                    }
                    return tagDocuments;
                }
            }
        }, {
            title: '状态',
            dataIndex: 'active',
            key: 'active',
            render: text => {

                if (text) {
                    return (
                        <Tooltip title='运行中'>
                            <Badge status="processing"/>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title='不可用'>
                            <Badge status="error"/>
                        </Tooltip>
                    )
                }
            }
        }, {
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => {
                    return (
                        <div>
                            <Button type="link" size='small'
                                    onClick={() => this.access(record)}>接入</Button>
                        </div>
                    )
                },
            }
        ];

        return (
            <>
                <Content key='page-content' className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>主机组</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.assetGroupFormRef} name="assetGroupForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="name"
                                        label="主机组名称"
                                    >
                                        <Input type='text' placeholder="请输入主机组名称" />
                                    </Form.Item>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>
                                        <Button style={{backgroundColor:'#F7F7F7 '}}
                                                onClick={() => {
                                                    this.assetGroupFormRef.current.resetFields();
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
                                            onClick={() => this.showModal('新增主机组', {})}>新增
                                    </Button>

                                    <Button style={{backgroundColor:'#F7F7F7 '}}
                                            onClick={() => { this.loadTableData(this.state.queryParams)}}>刷新
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table key='applyServe-table'
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
                               showTotal: total => `总计 ${total} 条`,
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
                            <AssetGroupModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            />
                            : null
                    }


                    <Modal title={<Text>主机组「<strong>{this.state.currentRow['name']}</strong>」</Text>}
                           visible={this.state.tabModalVisible}
                           style={{top:30}}
                           width={1300}
                           footer={null}
                           onCancel={()=>{this.setState({tabModalVisible:false})} }
                           centered={true}
                    >
                        <div>
                            <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                <Col span={14} key={1}>
                                    <Text italic>主机列表</Text>
                                </Col>
                                <Col span={10} key={2} style={{textAlign: 'right'}}>
                                    <Space>
                                        <Button type="primary" size='small' disabled={!hasPermission(this.state.currentRow['ownerId'])}
                                                onClick={() => {
                                                    this.handleSearchByAssetName(this.state.currentRow['id'])
                                                        .then(() => {
                                                            this.setState({
                                                                changeAssetVisible: true,
                                                            })
                                                            this.changeAssetFormRef
                                                                .current
                                                                .setFieldsValue({
                                                                    assetIds:this.state.selectedAssets
                                                                })
                                                        });
                                                }}>关联主机</Button>

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {this.loadTableData3(this.state.currentRow['id'])}}>刷新
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </div>

                        <Table
                            dataSource={this.state.items3}
                            columns={columns3}
                            position={'both'}
                            scroll={{y:500}}
                            loading={this.state.loading3}
                            pagination={{
                                hideOnSinglePage:true
                            }}
                            bordered
                            size={'small'}
                        />
                    </Modal>

                    <Modal title={<Text>更换主机「<strong>{this.state.currentRow['name']}</strong>」的所有者</Text>}
                           visible={this.state.changeOwnerModalVisible}
                           confirmLoading={this.state.changeOwnerConfirmLoading}

                           onOk={() => {
                               this.setState({
                                   changeOwnerConfirmLoading: true
                               });

                               let changeOwnerModalVisible = false;
                               this.changeOwnerFormRef
                                   .current
                                   .validateFields()
                                   .then(async values => {
                                       let result = await request.post(`/assetgroup/${this.state.currentRow['id']}/change-owner?owner=${values['owner']}`);
                                       if (result['code'] === 1) {
                                           message.success(result['message']);
                                           this.loadTableData();
                                       } else {
                                           message.error(result['message'], 10);
                                           changeOwnerModalVisible = true;
                                       }
                                   })
                                   .catch(info => {

                                   })
                                   .finally(() => {
                                       this.setState({
                                           changeOwnerConfirmLoading: false,
                                           changeOwnerModalVisible: changeOwnerModalVisible
                                       })
                                   });
                           }}
                           onCancel={() => {
                               this.setState({
                                   changeOwnerModalVisible: false
                               })
                           }}
                    >

                        <Form ref={this.changeOwnerFormRef}>

                            <Form.Item name='owner' rules={[{required: true, message: '请选择所有者'}]}>
                                <Select
                                    showSearch
                                    placeholder='请选择所有者'
                                    onSearch={this.handleGetName}
                                    filterOption={false}
                                >
                                    {this.state.users.map(d => <Select.Option key={d.id}
                                                                              value={d.id}>{d.username}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>

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
                                       const result = await request.put(`/assetgroup/asset/${this.state.currentRow['id']}?assetid=${values['assetIds']}`);
                                       if (result.code === 1) {
                                           message.success(result.message);
                                           await this.loadTableData3(this.state.currentRow['id']);
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

                </Content>
            </>
        );
    }
}

export default AssetGroup;
