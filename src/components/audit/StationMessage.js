import React, {Component} from 'react';
import {
    Button, Checkbox,
    Col, Divider, Form,
    Input,
    Layout,
    Modal,
    Row, Select,
    Space,
    Table,
    Tooltip,
    Typography,
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, ExclamationCircleOutlined, UpOutlined} from "@ant-design/icons";

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

class StationMessage extends Component {

    messageFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
        },
        loading: false,
        selectedRowKeys: [],
        delBtnLoading: false,
        selectedRow: {},
        display:'none',
        judge:'down',
    };

    componentDidMount() {
        this.loadTableData();
    }

    async loadTableData(queryParams) {
        queryParams = queryParams || this.state.queryParams;

        this.setState({
            queryParams: queryParams,
            loading: true
        });

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/message/paging?' + paramsStr);
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

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams)
    };

    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.theme,
            "isRead":values.isRead,
        }

        this.loadTableData(query);
    };

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/message/' + this.state.selectedRowKeys.join(','));
            if (result.code === 1) {
                message.success('操作成功', 5);
                this.setState({
                    selectedRowKeys: []
                })
                window.location.reload();
            } else {
                message.error('删除失败: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    clearMessage = async () => {
        this.setState({
            clearBtnLoading: true
        })
        try {
            let result = await request.delete('/message/clear');
            if (result.code === 1) {
                message.success('操作成功', 5);
                this.setState({
                    selectedRowKeys: []
                })
                window.location.reload();
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                clearBtnLoading: false
            })
        }
    }

    handleAllReviewed = async () => {
        this.setState({
            reviewedAllBtnLoading: true
        })
        try {
            let result = await request.post(`/message/all_mark`);
            if (result.code === 1) {
                message.success(result.message, 5);
                this.setState({
                    selectedRowKeys: []
                })
                window.location.reload();
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                reviewedAllBtnLoading: false
            })
        }
    }

    handleReviewed = async () => {
        this.setState({
            reviewedBtnLoading: true
        })
        try {
            let result = await request.post(`/message/batch_mark/${this.state.selectedRowKeys.join(',')}`);
            if (result.code === 1) {
                message.success(result.message, 5);
                this.setState({
                    selectedRowKeys: []
                })
                window.location.reload();
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                reviewedBtnLoading: false
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


    render() {

        const columns = [{
            title: '主题',
            dataIndex: 'theme',
            key: 'theme'
        }, {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
            width:600,
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        },  {
            title: '时间',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            }
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => {

                return (
                    <div>
                        <Button type="link" size='small' onClick={() => {
                            confirm({
                                title: '您确定要删除此项吗?',
                                content: '',
                                okText: '确定',
                                okType: 'danger',
                                cancelText: '取消',
                                onOk() {
                                    del(record.id)
                                }
                            });

                            const del = async (id) => {
                                const result = await request.delete(`/message/${id}`);
                                if (result.code === 1) {
                                    message.success(result.message,5);
                                    window.location.reload();
                                } else {
                                    message.error(result.message);
                                }

                            }
                        }}>删除</Button>

                        <Button type="link" size='small'
                                onClick={ async () =>{
                                    let result = await request.post(`/message/batch_mark/${record.id}`);
                                    if (result.code === 1) {
                                        message.success(result.message,5);
                                        window.location.reload();
                                    } else {
                                        message.error(result.message);
                                    }
                                } }>读取</Button>
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


        return (
            <>
                <Content className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>站内消息</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.messageFormRef} name="messageForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="theme"
                                        label="主题"
                                    >
                                        <Input type='text' placeholder="请输入主题名称" />
                                    </Form.Item>

                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="isRead"
                                            label="是否已读"
                                        >
                                            <Select allowClear placeholder="请选择">
                                                <Select.Option value="">全部</Select.Option>
                                                <Select.Option value="true">已读</Select.Option>
                                                <Select.Option value="false">未读</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>
                                        { Message }
                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {
                                                    this.messageFormRef.current.resetFields();
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
                                    <Button style={{backgroundColor:'#F7F7F7'}}
                                            loading={this.state.reviewedAllBtnLoading}
                                            onClick={this.handleAllReviewed}>全部标为已阅
                                    </Button>

                                    <Button disabled={!hasSelected} style={{backgroundColor:'#F7F7F7'}}
                                            loading={this.state.reviewedBtnLoading}
                                            onClick={this.handleReviewed}>标为已阅
                                    </Button>

                                    <Button type="primary" danger
                                            loading={this.state.clearBtnLoading}
                                            onClick={() => {
                                                const content = <Text style={{color: 'red'}}
                                                                      strong>您确定要清空全部的消息吗？</Text>;
                                                confirm({
                                                    icon: <ExclamationCircleOutlined/>,
                                                    content: content,
                                                    okType: 'danger',
                                                    onOk: this.clearMessage,
                                                    onCancel() {

                                                    },
                                                });
                                            }}>清空
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table rowSelection={rowSelection}
                           dataSource={this.state.items}
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
                           rowClassName={(record, index) => {
                               return (
                                   record.status ? '' : 'rowBackground'
                               )
                           }}
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

                </Content>
            </>
        );
    }
}

export default StationMessage;
