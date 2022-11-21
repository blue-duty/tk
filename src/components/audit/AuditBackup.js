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
    DatePicker,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {download, getToken} from "../../utils/utils";
import {
    DownOutlined,
    ExclamationCircleOutlined, UpOutlined
} from '@ant-design/icons';

import {server} from "../../common/env";


const { RangePicker } = DatePicker;

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

class AuditBackup extends Component {

    assetFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            name: '',
            beginTime: '',
            endTime: ''
        },
        loading: false,
        modalVisible: false,
        modalTitle: '',
        modalConfirmLoading: false,
        credentials: [],
        tags: [],
        selectedTags: [],
        model: {},
        selectedRowKeys: [],
        delBtnLoading: false,
        changeOwnerModalVisible: false,
        changeSharerModalVisible: false,
        changeOwnerConfirmLoading: false,
        changeSharerConfirmLoading: false,
        users: [],
        selected: {},
        selectedSharers: [],
        importModalVisible: false,
        fileList: [],
        uploading: false,
        display:'none',
        judge:'down',
        startTime:'',//开始时间
        endTime:'',  //结束时间
    };

    async componentDidMount() {
        this.loadTableData();
    }

    async delete(name) {
        const result = await request.delete('/auditbackup/' + name);
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
            let result = await request.get('/auditbackup/paging?' + paramsStr);
            if (result['code'] === 1) {
                data = result['data'];
            } else {
                message.error(result['message']);
            }
        } catch (e) {

        } finally {
            data.items = data.items? data.items:[]
            const items = data.items.map(item => {
                return {'key': item['name'], ...item}
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
            'name': values.name,
            'beginTime': this.state.startTime,
            'endTime': this.state.endTime,
        }
        this.setState({
            name: values.name,
        })
        this.loadTableData(query)
    }

    //导出
    handleExport= async (name) =>{
        let token = getToken();
        let query = {
            'file': name,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}auditbackup/export?${queryStr}`);
    }

    showDeleteConfirm(name, content) {
        let self = this;
        confirm({
            title: '您确定要删除此备份吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(name);
            }
        });
    };

    handleCancelModal = e => {
        this.setState({
            modalTitle: '',
            modalVisible: false
        });
    };

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/auditbackup/' + this.state.selectedRowKeys.join(','));
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

    auditBackup = async () => {
        let result = await request.post('/auditbackup/now');
        if (result.code === 1) {
            message.success('备份成功', 3);
            await this.loadTableData(this.state.queryParams);
        } else {
            message.error('备份失败: ' + result.message, 10);
        }
    }

    render() {

        const columns = [{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '大小',
            dataIndex: 'size',
            key: 'size',
            render: (value, item) => {
                if (!item['isDir'] && !item['isLink']) {
                    return <span className={'dode'}>{renderSize(value)}</span>;
                }
                return <span className={'dode'}/>;
            },
            sorter: (a, b) => {
                if (a['key'] === '..') {
                    return 0;
                }

                if (b['key'] === '..') {
                    return 0;
                }
                return a.size - b.size;
            },
        }, {
            title: '备份日期',
            dataIndex: 'modTime',
            key: 'modTime',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },{
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={() => this.handleExport(record.name)}>导出</Button>

                        <Button type="text" size='small' danger
                                onClick={() => this.showDeleteConfirm(record.name)}>删除</Button>
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
                <Content key='page-content' className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>审计备份</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.assetFormRef}
                                      name="assetForm"
                                      layout="horizontal"
                                      labelAlign="left"
                                      onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="name"
                                        label="名称"
                                    >
                                        <Input type='text' placeholder="请输入文件名" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="time"
                                            label="时间"
                                        >
                                            <RangePicker
                                                showTime={{ format: 'HH:mm:ss' }}
                                                format="YYYY-MM-DD HH:mm:ss"
                                                allowEmpty={[true,true]}
                                                onChange={this.onPickerChange}
                                            />
                                        </Form.Item>
                                    </div>
                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>

                                        { Message }

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => {
                                            this.assetFormRef.current.resetFields();
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

                                    <Button type="primary" onClick={this.auditBackup}
                                            >立即本地备份
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table key='audit-table'
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
                    </Content>
            </>
        );
    }
}

export function renderSize(value) {
    if (null == value || value === '' || value === 0) {
        return "0 Bytes";
    }
    const unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let srcSize = parseFloat(value);
    let index = Math.floor(Math.log(srcSize) / Math.log(1024));
    let size = srcSize / Math.pow(1024, index);
    size = size.toFixed(2);
    return size + ' ' + unitArr[index];
}


export default AuditBackup;
