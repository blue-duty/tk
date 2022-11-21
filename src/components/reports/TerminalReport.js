import React, {Component} from 'react';

import {
    Button,
    Col,
    Input,
    Layout,
    Modal,
    Row,
    Space,
    Table,
    Typography,
    Tabs, Form,
} from "antd";

import request from "../../common/request";
import {message} from "antd/es";
import PlanReportModal from "./PlanReportModal";
import {download, getToken} from "../../utils/utils";
import qs from "qs";
import {server} from "../../common/env";


const confirm = Modal.confirm;
const {Content} = Layout;
const {Text} = Typography;
const { TabPane } = Tabs;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class TerminalReport extends Component {

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
        selectedRowKeys: [],
        forbidLoading:false,
        dataForm:{},

        //第二张表
        items2: [],
        total2: 0,
        queryParams2: {
            pageIndex: 1,
            pageSize: 10
        },
        loading2: false,
        modalVisible2: false,
        modalTitle2: '',
        modalConfirmLoading2: false,
        selectedRowKeys2:[],
        currentRow:{},
    };

    jobexportFormRef = React.createRef();

    componentDidMount() {
        this.loadTableData();
        this.loadTableData2();
    }

    handleOnTabChange = () => {
        this.loadTableData();
        this.loadTableData2();
    }
    async loadTableDataSearch(name) {
        this.setState({
            loading: true
        });

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/datast/planreportfd/'+name);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items?data.items:[]
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items: items,
                total: data.total,
                loading: false
            });
        }
    }


    async loadTableData() {
        this.setState({
            loading: true
        });


        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/datast/planreportall');
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items?data.items:[]
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items: items,
                total: data.total,
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

        await this.loadTableData()
    };

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }
        this.loadTableData(query);
    }
    handleTableChange2 = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }
        this.loadTableData2(query);
    }
    handleSearch = async (values) => {
        this.loadTableDataSearch(values.name)
    }

    async deletejob(id) {
        console.log("id"+id);
        const result = await request.post('/datast/planreportdel/' + id);
        if (result.code === 1) {
            message.success('删除成功');
            await this.loadTableData();
        } else {
            message.error('删除失败: ' + result.message, 10);
        }
    }

    showDeleteConfirm(content) {
        let self = this;
        let id=content["key"];
        console.log(content["key"])
        confirm({
            title: '您确定要删除此项吗?',
            content: content["name"],
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.deletejob(id);
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
        for (let key in formData) {
            if (key.startsWith('first_time') ) {
                formData[key] = Number(formData[key]);
            }
        }
        if (formData.key) {
            // 编辑
            const result = await request.post(`/datast/planreportup/`+formData["key"], formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false ,
                    modalConfirmLoading: false
                });
                this.loadTableData();
            } else {
                message.error('更新失败: ' + result.message, 10);
                this.setState({
                    modalConfirmLoading: false
                });
            }
        } else{
            // 新增
            const result = await request.post('/datast/planreport', formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false,
                    modalConfirmLoading: false
                });
                this.loadTableData();
            } else {
                message.error('新增失败: ' + result.message, 10);
                this.setState({
                    modalConfirmLoading: false
                });
            }
            this.setState({
                modalConfirmLoading: false
            });
        }

    };



    //导出
    async download(id,reportname){
        let token = getToken();
        let query = {
            'X-Auth-Token': token,
            'id':id,
            'name':reportname,
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}datast/planreportsexport?${queryStr}`);
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

    //第二个页面
    async loadTableData2(query) {
        this.setState({
            loading2: true
        });


        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/datast/planreports');
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items?data.items:[]
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items2: items,
                total2: data.total,
                loading2: false
            });
        }
    }


    render() {

        const columns = [{
            title: '任务名称',
            dataIndex: 'name',
            key: 'name',
        },{
            title: '报表类型',
            dataIndex: 'form_name',
            key: 'form_name',
        },{
            title: '执行周期',
            dataIndex: 'cyclet',
            key: 'cyclet',
        },{
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            sorter: (a, b) => Date.parse(a.created) - Date.parse(b.created),
            defaultSortOrder: 'descend',
            sortDirections: ['ascend'],
        }, {
            title: '描述',
            dataIndex: 'describe',
            key: 'describe',

        },{
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={()=>this.showModal('修改', record)}>编辑</Button>

                        <Button type="text" size='small' danger
                                onClick={() => this.showDeleteConfirm(record)}>删除</Button>
                    </div>
                )
            },
        }
        ];


        const columns2 = [{
            title: '报表名称',
            dataIndex: 'form_name',
            key: 'form_name',
        },{
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            sorter: true,
        },{
            title: '操作',
            key: 'action',
            render: (text, record2, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={()=>this.download(record2["key"],record2["form_name"])}>导出</Button>
                    </div>
                )
            },
        }
        ];



        return (
            <>
                <Content className="site-layout-background page-content">
                    <Text italic style={{fontSize:20,color:'#666'}}>定期报表</Text>
                    <Tabs type="card" onChange={this.handleOnTabChange} style={{marginTop:20}}>
                        <TabPane tab="定期任务" key="1">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.jobexportFormRef} name="jobexportForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="name"
                                                label="任务名称"
                                            >
                                                <Input type='text' placeholder="请输入任务名称" />
                                            </Form.Item>

                                            <Form.Item {...formTailLayout} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    搜索
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {
                                                            this.jobexportFormRef.current.resetFields();
                                                            this.loadTableData()
                                                        }}>重置查询
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Col>
                                    <Col span={10} key={2} style={{textAlign: 'right'}}>
                                        <Space>

                                            <Button type="primary"
                                                    onClick={() => this.showModal('新增',{})}>新增
                                            </Button>

                                            <Button style={{backgroundColor:'#F7F7F7'}}
                                                    onClick={() => { this.loadTableData()}}>刷新
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
                                    <PlanReportModal
                                        visible={this.state.modalVisible}
                                        title={this.state.modalTitle}
                                        handleOk={this.handleOk}
                                        handleCancel={this.handleCancelModal}
                                        confirmLoading={this.state.modalConfirmLoading}
                                        model={this.state.model}
                                    >
                                    </PlanReportModal> : undefined
                            }

                        </TabPane>
                        <TabPane tab="查看报表" key="2">

                            <Table
                                dataSource={this.state.items2}
                                columns={columns2}
                                position={'both'}
                                pagination={{
                                    total: this.state.total2,
                                    showTotal: total => `总计 ${total} 条`
                                }}
                                loading={this.state.loading}
                                onChange={this.handleTableChange2}
                                bordered
                                size={'small'}
                            />
                        </TabPane>
                    </Tabs>
                </Content>
            </>
        );
    }
}

export default TerminalReport;
