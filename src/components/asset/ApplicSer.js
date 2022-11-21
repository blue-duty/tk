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
    Space,
    Table,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, ExclamationCircleOutlined,UpOutlined} from '@ant-design/icons';
import ApplicSerModal from './ApplcSerModal';
import ProgramModal from "./ProgramModal";


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

class ApplicSer extends Component {

    applyServeFormRef = React.createRef();

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
        display:'none',
        judge:'down',
        currentRow:{},
        //表2
        tabModalVisible:false,
        items3: [],
        total3: 0,
        queryParams3: {
            pageIndex: 1,
            pageSize: 10,
        },
        loading3: false,
        modalVisible3: false,
        modalTitle3: '',
        modalConfirmLoading3: false,
        selectedRowKeys3:[]
    };

    async componentDidMount() {

        this.loadTableData();
    }

    async delete(id) {
        const result = await request.delete('/appserver/' + id);
        if (result['code'] === 1) {
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
            let result = await request.get('/appserver/paging?' + paramsStr);
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

    //搜索
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
            'ip': values.ip,
        }
        this.setState({
            'name': values.name,
            'ip': values.ip,
        })
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
                self.delete(id);
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
            const result = await request.put('/appserver/' + formData.id, formData);
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
            const result = await request.post('/appserver', formData);
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
            let result = await request.delete('/appserver/' + this.state.selectedRowKeys.join(','));
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


    //第2个页面
    async loadTableData3(queryParam,id) {
        this.setState({
            loading3: true
        });

        let queryParams = {
            ...queryParam,
            'id':id,
        };

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/appserver/program?' + paramsStr);
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
                items3: items,
                total3: data.length,
                loading3: false
            });
        }
    }

    handleChangPage3 = async (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams3;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        await this.loadTableData3(queryParams,this.state.currentRow['id'])
    };

    handleTableChange3 = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams3,
            'order': sorter.order,
            'field': sorter.field,
        }
        this.loadTableData3(query,this.state.currentRow['id']);
    }

    async delete3(record) {
        const result = await request.delete(`appserver/program?id=${record.id}`);
        if (result.code === 1) {
            message.success('删除成功');
            this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }
    }

    showDeleteConfirm3(record) {
        let self = this;
        confirm({
            title: '您确定要删除此项吗?',
            content: record.content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete3(record);
            }
        });
    };

    batchDelete3 = async () => {
        this.setState({
            delBtnLoading3: true
        })
        try {
            let result = await request.delete(`/appserver/program?id=${this.state.selectedRowKeys3.join(',')}`);
            if (result.code === 1) {
                message.success(result.message, 3);
                this.setState({
                    selectedRowKeys3: []
                })
                await this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
            } else {
                message.error('删除失败: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading3: false
            })
        }
    }

    showModal3(title, obj = null) {
        this.setState({
            modalTitle3: title,
            modalVisible3: true,
            model3: obj
        });
    };

    handleCancelModal3 = e => {
        this.setState({
            modalTitle3: '',
            modalVisible3: false
        });
    };

    handleOk3 = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading3: true
        });
        if (formData.id) {
            // 编辑
            const result = await request.put(`/appserver/${formData.id}/program`, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible3: false
                });
                this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
            } else {
                message.error('更新失败: ' + result.message, 10);
            }
        } else {
            // 新增
            const result = await request.post(`/appserver/${this.state.currentRow['id']}/program`, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible3: false
                });
                this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
            } else {
                message.error('新增失败: ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading3: false
        });
    };

    selectDataAll3 = () =>{
        if(this.state.items3.length === this.state.selectedRowKeys3.length){
            this.setState({
                selectedRowKeys3: []
            })
        }else{
            const index3 = [];
            this.state.items3.forEach(item=>{
                index3.push(item.key)
            });
            this.setState({
                selectedRowKeys3: index3
            })
        }
    }



    render() {

        const columns = [{
            title: '服务器名称',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                return (
                    <Button type="link" size='small'
                        onClick={() => this.showModal('更新应用服务器', record)}>{name}</Button>
                );
            },
            sorter: true,
        }, {
            title: '服务器地址',
            dataIndex: 'ip',
            key: 'ip',
        }, {
            title: '服务器类型',
            dataIndex: 'type',
            key: 'type',
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
                                    await this.loadTableData3(this.state.queryParams3,record.id)
                                    this.setState({
                                        tabModalVisible : true,
                                        currentRow : record
                                    })
                                }}>程序列表</Button>

                        <Button type="link" size='small'
                                onClick={() => this.showModal('编辑应用服务器',record)}>编辑</Button>

                        <Button type="text" size='small' danger
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


        const columns3 = [{
            title: '程序名称',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },{
            title: '程序路径',
            dataIndex: 'path',
            key: 'path',
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
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
            title: '操作',
            key: 'action',
            render: (text, record, index) => {

                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={() => this.showModal3('编辑程序', record)}>编辑</Button>

                        <Button type="text" size='small' danger
                                onClick={() => this.showDeleteConfirm3(record)}>删除</Button>

                    </div>
                )
            },
        }
        ];
        const rowSelection3 = {
            hideSelectAll:true,
            selectedRowKeys: this.state.selectedRowKeys3,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys3:selectedRowKeys
                });
            },
        };
        const hasSelected3 = this.state.selectedRowKeys3.length > 0;
        let isChecked3 = false
        if(this.state.items3.length!==0 && this.state.items3.length === this.state.selectedRowKeys3.length){
            isChecked3 = true
        }else {
            isChecked3 = false
        }

        return (
            <>
                <Content key='page-content' className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>应用服务器</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.applyServeFormRef} name="applyServeForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="name"
                                        label="服务器名称"
                                    >
                                        <Input type='text' placeholder="请输入应用服务器名称" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="ip"
                                            label="服务器地址"
                                        >
                                            <Input type='text' placeholder="请输入应用服务器地址" />
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>
                                        { Message }
                                        <Button style={{backgroundColor:'#F7F7F7 '}}
                                            onClick={() => {
                                            this.applyServeFormRef.current.resetFields();
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
                                            onClick={() => this.showModal('新增应用服务器', {})}>新增
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
                            <ApplicSerModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            />
                            : null
                    }


                    <Modal title={<Text>应用服务器「<strong>{this.state.currentRow['name']}</strong>」</Text>}
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
                                    <Text italic>程序列表</Text>
                                </Col>
                                <Col span={10} key={2} style={{textAlign: 'right'}}>
                                    <Space>
                                        <Button type="primary"
                                                onClick={() => this.showModal3('新增程序',{})}>添加程序
                                        </Button>

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {this.loadTableData3(this.state.queryParams3,this.state.currentRow['id'])}}>刷新
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </div>

                        <Table
                            rowSelection={rowSelection3}
                            dataSource={this.state.items3}
                            columns={columns3}
                            position={'both'}
                            scroll={{y:500}}
                            pagination={{
                                showSizeChanger: true,
                                current: this.state.queryParams3.pageIndex,
                                pageSize: this.state.queryParams3.pageSize,
                                onChange: this.handleChangPage3,
                                onShowSizeChange: this.handleChangPage3,
                                total: this.state.total3,
                                showTotal: total => `总计 ${total} 条`
                            }}
                            loading={this.state.loading3}
                            onChange={this.handleTableChange3}
                            bordered
                            size={'small'}
                        />

                        <div style={{margin:'-45px 0px -6px 17px'}}>
                            <Checkbox style={{marginRight:17}} onChange={this.selectDataAll3} checked={isChecked3} />
                            <Button type="primary" danger disabled={!hasSelected3}
                                    loading={this.state.delBtnLoading3}
                                    onClick={() => {
                                        const content = <div>
                                            您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                           strong>{this.state.selectedRowKeys3.length}</Text>条记录吗？
                                        </div>;
                                        confirm({
                                            icon: <ExclamationCircleOutlined/>,
                                            content: content,
                                            onOk: () => {
                                                this.batchDelete3()
                                            },
                                            onCancel() {

                                            },
                                        });
                                    }}>批量删除
                            </Button>
                        </div>

                        {
                            this.state.modalVisible3 ?
                                <ProgramModal
                                    visible={this.state.modalVisible3}
                                    title={this.state.modalTitle3}
                                    handleOk={this.handleOk3}
                                    handleCancel={this.handleCancelModal3}
                                    confirmLoading={this.state.modalConfirmLoading3}
                                    model={this.state.model3}
                                >
                                </ProgramModal> : undefined
                        }

                    </Modal>



                </Content>
            </>
        );
    }
}

export default ApplicSer;
