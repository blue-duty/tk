import React, {Component} from 'react';

import {
    Alert,
    Button, Checkbox,
    Col,
    Divider,
    Form,
    Input,
    Layout,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import DynamicCommandModal from "./DynamicCommandModal";
import {
    DownOutlined,
    ExclamationCircleOutlined,
    UpOutlined
} from '@ant-design/icons';

import {hasPermission, isAdmin} from "../../service/permission";
import ChooseAsset from "./ChooseAsset";

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

class DynamicCommand extends Component {

    dynamicFormRef = React.createRef();
    changeOwnerFormRef = React.createRef();

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
        assetsVisible: false,
        assets: [],
        checkedAssets: [],
        commandId: '',
        model: null,
        selectedRowKeys: [],
        delBtnLoading: false,
        changeOwnerModalVisible: false,
        changeSharerModalVisible: false,
        changeOwnerConfirmLoading: false,
        changeSharerConfirmLoading: false,
        users: [],
        selected: {},
        selectedSharers: [],
        indeterminate: true,
        checkAllChecked: false,
        display:'none',
        judge:'down',
    };

    componentDidMount() {
        this.loadTableData();
    }

    async delete(id) {
        const result = await request.delete('/commands/' + id);
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
            let result = await request.get('/commands/paging?' + paramsStr);
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
            'name': values.name,
            'content': values.content,
        }
        this.loadTableData(query)
    }

    showDeleteConfirm(id, content) {
        let self = this;
        confirm({
            title: '您确定要删除此指令吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(id);
            }
        });
    };

    showModal(title, assets = null) {
        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: assets
        });
    };

    handleCancelModal = e => {
        this.setState({
            modalTitle: '',
            modalVisible: false
        });
    };

    setCheckedAssets = (checkedAssets) => {
        this.setState({
            checkedAssets: checkedAssets
        })
    }

    executeCommand = e => {
        let checkedAssets = this.state.checkedAssets;
        if (checkedAssets.length === 0) {
            message.warning('请至少选择一个资产');
            return;
        }

        let cAssets = checkedAssets.map(item => {
            return {
                id: item['id'],
                name: item['name']
            }
        });

        window.location.href = '#/batch-command?commandId=' + this.state.commandId + '&assets=' + JSON.stringify(cAssets);
    };

    handleOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });

        if (formData.id) {
            // 向后台提交数据
            const result = await request.put('/commands/' + formData.id, formData);
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
            const result = await request.post('/commands', formData);
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

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/commands/' + this.state.selectedRowKeys.join(','));
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

    handleSearchByNickname = async nickname => {
        const result = await request.get(`/users/paging?pageIndex=1&pageSize=100&nickname=${nickname}`);
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

    onChange = (list) => {
        this.setState({
            checkedAssets: list,
            indeterminate: !!list.length && list.length < this.state.assets.length,
            checkAllChecked: list.length === this.state.assets.length
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        this.loadTableData(query);
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
            title: '指令名称',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                return (
                    <Button type="link" size='small'
                            onClick={() => this.showModal('更新指令',  record)}>{name}</Button>
                );
            },
            sorter: true,
        }, {
            title: '指令内容',
            dataIndex: 'content',
            key: 'content',
            render: (content, record) => {
                let short = content;
                if (short && short.length > 20) {
                    short = short.substring(0, 20) + " ...";
                }

                return (
                    <Tooltip placement="topLeft" title={content}>
                        {short}
                    </Tooltip>
                );
            }
        }, {
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
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => {

                return (
                    <div>
                        <Button type="link" size='small' onClick={async () => {

                            this.setState({
                                assetsVisible: true,
                                commandId: record['id']
                            });
                        }}>执行</Button>

                        <Button type="link" size='small'
                                disabled={!hasPermission(record['owner'])}
                                onClick={() => this.showModal('更新指令', record)}>编辑</Button>


                        {isAdmin() ?
                            <Button type="link" size='small'
                                    disabled={!hasPermission(record['owner'])}
                                    onClick={() => {
                                        this.handleSearchByNickname('')
                                            .then(() => {
                                                this.setState({
                                                    changeOwnerModalVisible: true,
                                                    selected: record,
                                                })
                                                this.changeOwnerFormRef
                                                    .current
                                                    .setFieldsValue({
                                                        owner: record['owner']
                                                    })
                                            });
                                    }}>更换所有者</Button>: undefined
                        }

                        <Button type="text" size='small' danger
                                disabled={!hasPermission(record['owner'])}
                                onClick={() => this.showDeleteConfirm(record.id, record.name)}>删除</Button>
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

        return (
            <>
                <Content className="site-layout-background page-content">

                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>动态指令</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.dynamicFormRef} name="dynamicForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="name"
                                        label="指令名称"
                                    >
                                        <Input type='text' placeholder="请输入指令名称" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="content"
                                            label="指令内容"
                                        >
                                            <Input type='text' placeholder="请输入指令内容" />
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>
                                        { Message }
                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {
                                                    this.dynamicFormRef.current.resetFields();
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
                                            onClick={() => this.showModal('新增指令', {})}>新增
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
                            <DynamicCommandModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            >

                            </DynamicCommandModal>
                            : null
                    }

                    <Modal
                        title="选择资产"
                        visible={this.state.assetsVisible}
                        width={window.innerWidth * 0.8}
                        centered={true}
                        onOk={this.executeCommand}
                        onCancel={() => {
                            this.setState({
                                assetsVisible: false
                            });
                        }}
                    >
                        <ChooseAsset
                            setCheckedAssets={this.setCheckedAssets}
                        >

                        </ChooseAsset>
                    </Modal>


                    <Modal title={<Text>更换指令「<strong style={{color: '#1890ff'}}>{this.state.selected['name']}</strong>」的所有者
                    </Text>}
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
                                       let result = await request.post(`/commands/${this.state.selected['id']}/change-owner?owner=${values['owner']}`);
                                       if (result['code'] === 1) {
                                           message.success('操作成功');
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
                                    onSearch={this.handleSearchByNickname}
                                    filterOption={false}
                                >
                                    {this.state.users.map(d => <Select.Option key={d.id}
                                                                              value={d.id}>{d.nickname}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Alert message="更换资产所有者不会影响授权凭证的所有者" type="info" showIcon/>

                        </Form>
                    </Modal>
                </Content>
            </>
        );
    }
}

export default DynamicCommand;
