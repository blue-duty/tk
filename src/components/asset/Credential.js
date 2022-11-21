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
    Space,
    Table,
    Tag,
    Typography
} from "antd";
import qs from "qs";
import CredentialModal from "./CredentialModal";
import request from "../../common/request";
import {message} from "antd/es";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {hasPermission, isAdmin} from "../../service/permission";

const confirm = Modal.confirm;
const {Text} = Typography;
const {Content} = Layout;

const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class Credential extends Component {

    credentialFormRef = React.createRef();
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
    };

    componentDidMount() {
        this.loadTableData();
    }

    async delete(id) {
        const result = await request.delete('/credentials/' + id);
        if (result.code === 1) {
            message.success('删除成功');
            await this.loadTableData(this.state.queryParams);
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
            let result = await request.get('/credentials/paging?' + paramsStr);
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

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams)
    };

    //搜索
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
        }
        this.loadTableData(query)
    }

    showDeleteConfirm(id, content) {
        let self = this;
        confirm({
            title: '您确定要删除此项吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(id).then(r => {
                });
            }
        });
    };

    showModal = async (title, id = null, index) => {

        let items = this.state.items;

        let model = {}
        if (id) {
            items[index].updateBtnLoading = true;
            this.setState({
                items: items
            });

            let result = await request.get('/credentials/' + id);
            if (result['code'] !== 1) {
                message.error(result['message']);
                items[index].updateBtnLoading = false;
                this.setState({
                    items: items
                });
                return;
            }

            items[index].updateBtnLoading = false;
            model = result['data']
        }

        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: model,
            items: items
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
            const result = await request.put('/credentials/' + formData.id, formData);
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
            const result = await request.post('/credentials', formData);
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
            let result = await request.delete('/credentials/' + this.state.selectedRowKeys.join(','));
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
            return {'key': item['id'], 'disabled': false, ...item}
        })

        this.setState({
            users: items
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
            title: '凭证名称',
            dataIndex: 'name',
            key: 'name',
            render: (name, record, index) => {
                return (
                    <Button type="link" size='small'
                        onClick={() => this.showModal('更新凭证',  record.id, index)}>{name}</Button>
                );
            },
            sorter: true,
        }, {
            title: '凭证类型',
            dataIndex: 'type',
            key: 'type',
            render: (type, record) => {

                if (type === 'private-key') {
                    return (
                        <Tag color="green">密钥</Tag>
                    );
                } else {
                    return (
                        <Tag color="red">密码</Tag>
                    );
                }
            }
        }, {
            title: '授权账户',
            dataIndex: 'username',
            key: 'username',
        }, {
            title: '所有者',
            dataIndex: 'ownerName',
            key: 'ownerName',
        }, {
            title: '创建时间',
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
                render: (text, record, index) => {

                    return (
                        <div>
                            <Button type="link" size='small' loading={this.state.items[index].updateBtnLoading}
                                    disabled={!hasPermission(record['owner'])}
                                    onClick={() => this.showModal('更新凭证', record.id, index)}>编辑</Button>

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

                                            }}>更换所有者</Button> : undefined
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
                        <Text italic style={{fontSize:20,color:'#666'}}>主机凭证</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.credentialFormRef} name="credentialForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="name"
                                        label="凭证名称"
                                    >
                                        <Input type='text' placeholder="请输入凭证名称" />
                                    </Form.Item>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {
                                                    this.credentialFormRef.current.resetFields();
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
                                            onClick={() => this.showModal('新增凭证')}>新增
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
                        rowKey='id'
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
                            <CredentialModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            >

                            </CredentialModal>
                            : null
                    }

                    <Modal title={<Text>更换凭证「<strong style={{color: '#1890ff'}}>{this.state.selected['name']}</strong>」的所有者
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
                                       let result = await request.post(`/credentials/${this.state.selected['id']}/change-owner?owner=${values['owner']}`);
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
                        </Form>
                    </Modal>
                </Content>
            </>
        );
    }
}

export default Credential;
