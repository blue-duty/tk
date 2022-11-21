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
    Table, Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, ExclamationCircleOutlined, UpOutlined} from '@ant-design/icons';
import ApplicModal from './ApplicModal';
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

class Application extends Component {

    applyFormRef = React.createRef();
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
        model: {},
        selectedRowKeys: [],
        delBtnLoading: false,
        changeOwnerModalVisible: false,
        changeSharerModalVisible: false,
        changeOwnerConfirmLoading: false,
        changeSharerConfirmLoading: false,
        users: [],
        selected: {},
        display:'none',
        judge:'down',
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
            let result = await request.get('/applic/paging?' + paramsStr);
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

    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
            'server': values.server,
            "program":values.program,
        }
        this.setState({
            'name': values.name,
            'server': values.server,
            "program":values.program,
        })
        this.loadTableData(query)
    }

    async delete(id) {
        const result = await request.delete('/applic/' + id);
        if (result['code'] === 1) {
            message.success('删除成功');
            await this.loadTableData(this.state.queryParams);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }

    }

    showDeleteConfirm(id, content) {
        let self = this;
        confirm({
            title: '您确定要删除此资产吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(id);
            }
        });
    };

    async update(id) {
        let result = await request.get(`/applic/${id}/info`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }
        await this.showModal('更新应用', result.data);
    }

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
            const result = await request.put('/applic/' + formData.id, formData);
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
            const result = await request.post('/applic', formData);
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

    access = async (record) => {
        const id = record['id'];

        message.loading({content: '正在检测应用是否在线...', key: id});
        let result = await request.post(`/applic/${id}/tcping`);
        if (result.code === 1) {
            if (result.data === true) {
                message.success({content: '检测完成，您访问的应用在线，即将打开窗口进行访问。', key: id, duration: 3});
                window.open(`#/appaccess?applicationId=${id}`);
            } else {
                message.warn({content: '您访问的应用未在线，请确认网络状态。', key: id, duration: 10});
            }
        } else {
            message.error({content: result.message, key: id, duration: 10});
        }

    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/applic/' + this.state.selectedRowKeys.join(','));
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

    handleSearchByNickname = async() => {
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
            title: '应用名称',
            dataIndex: 'name',
            key: 'name',
            render: (name, record, index) => {
                if (hasPermission(record['ownerId'])) {
                    return (
                        <Button type="link" size='small'
                                onClick={() => this.update(record.id)}>{name}</Button>
                    );
                }else{
                    return name
                }
            },
            sorter: true,
        }, {
            title: '服务器名称',
            dataIndex: 'applicationServerName',
            key: 'applicationServerName',
        },{
            title: '程序名称',
            dataIndex: 'programName',
            key: 'programName',
        }, {
            title: '参数',
            dataIndex: 'param',
            key: 'param',
            colSpan:0,
            render:()=>{return {props:{colSpan:0}};}
        }, {
            title: '所有者',
            dataIndex: 'owner',
            key: 'owner'
        }, {
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
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },{
            title: '操作',
            key: 'action',
            render: (text, record) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={() => this.access(record)}>接入</Button>

                        <Button type="link" size='small' disabled={!hasPermission(record['ownerId'])}
                                onClick={() => this.update(record.id)}>编辑</Button>

                        {isAdmin() ?
                                <Button type="link" size='small'
                                        disabled={!hasPermission(record['ownerId'])}
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
                                                            owner: record['ownerId']
                                                        })
                                                });
                                        }}>更换所有者</Button> : undefined
                        }

                        <Button type="text" size='small' danger disabled={!hasPermission(record['ownerId'])}
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
                        style={{backgroundColor:'#F7F7F7 '}}
                        onClick={() => {
                            this.setState({
                                display:'block',
                                judge:'up'})
                        }}>展开更多搜索条件
                </Button>
            )
        } else {
            Message = (
                <Button icon={<UpOutlined />} style={{backgroundColor:'#F7F7F7 '}} onClick={() => {
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
                <Content key='page-content' className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>应用列表</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.applyFormRef} name="applyForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="name"
                                        label="应用名称"
                                    >
                                        <Input type='text' placeholder="请输入应用名称" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="server"
                                            label="服务器名称"
                                        >
                                            <Input type='text' placeholder="请输入服务器名称" />
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="program"
                                            label="程序名称"
                                        >
                                            <Select allowClear placeholder="请选择程序名称">
                                                <Select.Option value="">全部程序</Select.Option>
                                                <Select.Option value="Chrome">Chrome</Select.Option>
                                                <Select.Option value="Firefox">Firefox</Select.Option>
                                                <Select.Option value="Edge">Edge</Select.Option>
                                                <Select.Option value="Navicat">Navicat</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>
                                        { Message }
                                        <Button style={{backgroundColor:'#F7F7F7 '}}
                                            onClick={() => {
                                            this.applyFormRef.current.resetFields();
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
                                            onClick={() => this.showModal('新增应用', {})}>新增
                                    </Button>

                                    <Button style={{backgroundColor:'#F7F7F7 '}}
                                        onClick={() => { this.loadTableData(this.state.queryParams)}}>刷新
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table key='assets-table'
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
                            <ApplicModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            />
                            : null
                    }

                    <Modal title={<Text>更换资源「<strong style={{color: '#1890ff'}}>{this.state.selected['name']}</strong>」的所有者
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
                                       let result = await request.post(`/applic/${this.state.selected['id']}/change-owner?uid=${values['owner']}`);
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

export default Application;
