import React, {Component} from 'react';
import {
    Button,
    Form,
    Input,
    Layout,
    Select,
    Tabs,
    Typography,
    Spin,
    Space,
    Row,
    Col,
    Table,
    Modal, Checkbox,
} from "antd";
import request from "../../common/request";
import {message} from "antd/es";
import { ExclamationCircleOutlined} from "@ant-design/icons";
import qs from "qs";
import StaticRouteModal from "./StaticRouteModal";
import { nanoid } from 'nanoid';
import NetwordModal from "./NetworkModal";

const {Content} = Layout;
const {Option} = Select;
const {TabPane} = Tabs;
const {Text} = Typography;
const confirm = Modal.confirm;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class NetworkConfig extends Component {

    state = {
        properties: {},
        netNames:[],
        testLoad:false,
        areaResult:undefined,
        staticItems:[],
        staticSelectedRows:[],
        basicSelectedRows:[],
        basiInformationItems:[],
        staticTotal: 0,
        staticTabLoading:false,
        staticQueryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        basicTabLoading:false,
        delStaticLoading: false,
        modalVisible: false,
        modalTitle: '',
        modalConfirmLoading: false,
        model: null,
        netmodalVisible: false,
        netmodalTitle: '',

    }

    diagnosisFormRef = React.createRef();
    staticFormRef = React.createRef();
    dnsFormRef = React.createRef();

    componentDidMount() {

        // eslint-disable-next-line no-extend-native
        String.prototype.bool = function () {
            return (/^true$/i).test(this);
        };

        this.loadStaticTableData();
        this.getdnsProperties();
        this.loadbasicTableData();
    }

    networkDetection = async (values) => {
        this.setState({ testLoad : true })
        let result = await request.put('/network-detection', values);
        if (result.code === 1) {
            this.setState({
                areaResult : result.data,
                testLoad : false
            })
        } else {
            message.error(result.message);
            this.setState({ testLoad : false })
        }
    }

    getdnsProperties = async () => {
        let result = await request.get('/dns-config');
        if (result['code'] === 1) {
            let dnsproperties = result['data'];
            this.setState({
                dnsproperties: dnsproperties
            })

            if (this.dnsFormRef.current) {
                this.dnsFormRef.current.setFieldsValue(dnsproperties)
            }
        } else {
            message.error(result['message']);
        }
    }

    changednsProperties = async (values) => {
        console.log(values)
        let result = await request.post(`/dns-config?dns=${values['dns']}&standbyDns=${values['standby_dns']}`);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    async loadStaticTableData(queryParams) {
        this.setState({
            staticTabLoading: true
        });

        queryParams = queryParams || this.state.staticQueryParams;

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/staticroute?' + paramsStr);
            if (result['code'] === 1) {
                data = result['data'];
            } else {
                message.error(result['message']);
            }
        } catch (e) {

        } finally {
            data.items = data.items ? data.items:[]
            const items = data.items.map(item => {
                return {'key': nanoid(6), ...item}
            })
            this.setState({
                staticItems: items,
                staticTotal: data.total,
                staticQueryParams: queryParams,
                staticTabLoading: false
            });
        }
    }

    async loadbasicTableData() {
        this.setState({
            basicTabLoading: true
        });

        let data = [];

        try {
            let result = await request.get('/network-config');
            if (result['code'] === 1) {
                data = result['data'];
            } else {
                message.error(result['message']);
            }
        } catch (e) {

        } finally {
            data = data ?data :[]
            const items = data.map(item => {
                return {'key': nanoid(6), ...item}
            })
            this.setState({
                basicItems: items,
                basicTabLoading: false
            });
        }
    }

    handleSearch = async (values) => {
        let query = {
            ...this.state.staticQueryParams,
            'pageIndex': 1,
            'pageSize': this.state.staticQueryParams.pageSize,
            'address': values.desAddres,
        }
        this.loadStaticTableData(query);
    };

    async staticDelete(record) {
        const result = await request.post('/staticroutedele',[record]);
        if (result['code'] === 1) {
            message.success(result.message);
            await this.loadStaticTableData(this.state.staticQueryParams);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }
    }

    async networkrestart(record) {
        const result = await request.post(`/network-config?name=${record.name}`);
        if (result['code'] === 1) {
            message.success(result.message);
            await this.loadbasicTableData();
        } else {
            message.error('重启服务失败: ' + result.message, 10);
        }
    }

    showStaticDelete(record) {
        let self = this;
        confirm({
            title: '您确定要删除此项吗?',
            content: record.networkCard,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.staticDelete(record);
            }
        });
    };

    showBasiRestart(record) {
        let self = this;
        this.setState({networkname:record.name})
        confirm({
            title: '您确定要重启服务吗?',
            content: record.name,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.networkrestart(record);
            }
        });
    };

    batchStaticDelete = async () => {
        this.setState({
            delStaticLoading: true
        })
        try {
            let result = await request.post('/staticroutedele',this.state.staticSelectedRows);
            if (result.code === 1) {
                message.success(result.message, 3);
                this.setState({
                    staticSelectedRows: []
                })
                await this.loadStaticTableData(this.state.staticQueryParams);
            } else {
                message.error('删除失败: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delStaticLoading: false
            })
        }
    }

    handleStaticChangPage = async (pageIndex, pageSize) => {
        let queryParams = this.state.staticQueryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            staticQueryParams: queryParams
        });

        await this.loadStaticTableData(queryParams)
    };

    handleStaticTableChange = async (pagination, filters, sorter) => {
        let query = {
            ...this.state.staticQueryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        await this.loadStaticTableData(query);
    }

    showModal(title, staticRoute = null) {
        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: staticRoute,
        });
    };

    shownetModal(title, basicRoute = null) {
        this.setState({
            netmodalTitle: title,
            netmodalVisible: true,
            model: basicRoute,
        });
    };

    handleCancelnetModal = e => {
        this.setState({
            netmodalTitle: '',
            netmodalVisible: false
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
        if (formData.key) {
            // 编辑
            const result = await request.put(`/staticroute?desAddres=${this.state.model.desAddres}&nextHop=${this.state.model.nextHop}&submask=${this.state.model.subnetMask}&networkCard=${this.state.model.networkCard}`, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false
                });
                this.loadStaticTableData(this.state.staticQueryParams);
            } else {
                message.error('更新失败: ' + result.message, 10);
            }
        } else {
            // 新增
            const result = await request.post('/staticroute', formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false
                });
                this.loadStaticTableData(this.state.staticQueryParams);
            } else {
                message.error('新增失败: ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    handlenetOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });

        const result = await request.put(`/network-config`, formData);
        if (result.code === 1) {
            message.success(result.message);
            this.setState({
                netmodalVisible: false
            });
            this.loadbasicTableData();
        } else {
            message.error('修改失败: ' + result.message, 10);
            this.setState({
                netmodalVisible: false
            });
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    selectDataAll = () =>{
        if(this.state.staticItems.length === this.state.staticSelectedRows.length){
            this.setState({
                staticSelectedRows: []
            })
        }else{
            this.setState({
                staticSelectedRows: this.state.staticItems
            })
        }
    }

    handleOnTabChange = () => {
        this.loadStaticTableData();
        this.loadbasicTableData();
        this.getdnsProperties();
    }

    render() {
        const staticColumns = [{
            title: '网卡名称',
            dataIndex: 'networkCard',
            key: 'networkCard',
        }, {
            title: '目的地址',
            dataIndex: 'desAddres',
            key: 'desAddres',
        }, {
            title: '子网掩码',
            dataIndex: 'subnetMask',
            key: 'subnetMask',
        },{
            title: '下一跳地址',
            dataIndex: 'nextHop',
            key: 'nextHop',
        },{
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={()=>this.showModal('修改', record)}>编辑</Button>

                        <Button type="text" size='small' danger
                                onClick={() => this.showStaticDelete(record)}>删除</Button>
                    </div>
                )
            },
        }
        ];

        const staticRowSelection = {
            hideSelectAll:true,
            selectedRowKeys: this.state.staticSelectedRows.map(item=>item.key),
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    staticSelectedRows:selectedRows
                });
            },
        };
        const staticHasSelected = this.state.staticSelectedRows.length > 0;

        let isChecked = false
        if(this.state.staticItems.length!==0 && this.state.staticItems.length === this.state.staticSelectedRows.length){
            isChecked = true
        }else {
            isChecked = false
        }


        const basicInformation = [{
            title: '接口名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'IP地址',
            dataIndex: 'ip',
            key: 'ip',
        }, {
            title: '网关',
            dataIndex: 'gateway',
            key: 'gateway',
        },{
            title: '子网掩码',
            dataIndex: 'netmask',
            key: 'netmask',
        },{
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: text => {
                if (text==='yes') {
                    return '开启'
                } else {
                    return '关闭'
                }
            }
        },{
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={()=>this.shownetModal('修改', record)}>编辑</Button>

                        <Button type="text" size='small' danger disabled={record.status!=='yes'}
                                onClick={() => this.showBasiRestart(record)}>重启服务</Button>
                    </div>
                )
            },
        }
        ];


        return (
            <>
                <Content className="site-layout-background page-content">

                    <Tabs tabPosition={'top'} type="card" onChange={this.handleOnTabChange} tabBarStyle={{width: '100%'}}>

                        <TabPane tab="基础信息配置 " key="rdp">

                            <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                <Col span={14} key={1}>
                                    <Text italic style={{fontSize:20,color:'#666'}}>网卡信息</Text>
                                </Col>
                                <Col span={10} key={2} style={{textAlign: 'right'}}>
                                    <Space>
                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => { this.loadbasicTableData()}}>刷新
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>

                            <Table key='basicInformation'
                                   dataSource={this.state.basicItems}
                                   columns={basicInformation}
                                   position={'both'}
                                   scroll={{y:500}}
                                   loading={this.state.basicTabLoading}
                                   pagination={{
                                       hideOnSinglePage:true
                                   }}
                                   bordered
                                   size={'small'}
                            />

                            {
                                this.state.netmodalVisible ?
                                    <NetwordModal
                                        visible={this.state.netmodalVisible}
                                        title={this.state.netmodalTitle}
                                        handleOk={this.handlenetOk}
                                        handleCancel={this.handleCancelnetModal}
                                        confirmLoading={this.state.modalConfirmLoading}
                                        model={this.state.model}
                                    >
                                    </NetwordModal> : null
                            }

                            <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'20px 0'}}>
                                <Col span={14} key={1} style={{textAlign: 'left'}}>
                                    <Text italic style={{fontSize:20,color:'#666'}}>DNS配置</Text>
                                </Col>
                                <Col span={10} key={2} style={{textAlign: 'right'}}>
                                </Col>
                            </Row>

                            <Form ref={this.dnsFormRef} name="dns" onFinish={this.changednsProperties}
                                  layout="inline">
                                <Form.Item
                                    name="dns"
                                    label="DNS"
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入dns',
                                        },
                                        {
                                            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                            message: '请输入合法的dns'
                                        }
                                    ]}
                                >
                                    <Input type='text' placeholder="请输入合法的dns"/>
                                </Form.Item>

                                <Form.Item
                                    name="standby_dns"
                                    label="备选DNS"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                        {
                                            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                            message: '请输入合法的备选DNS'
                                        }
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>


                                <Form.Item>
                                    <Button  type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                </Form.Item>
                            </Form>

                        </TabPane>
                        <TabPane tab="静态路由" key="staticRoute">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.staticFormRef} name="staticForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="desAddres"
                                                label="目的地址"
                                            >
                                                <Input type='text' placeholder="请输入目的地址" />
                                            </Form.Item>

                                            <Form.Item {...formTailLayout} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    搜索
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {
                                                            this.staticFormRef.current.resetFields();
                                                            this.loadStaticTableData({
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
                                                    onClick={() => this.showModal('新增',{})}>新增
                                            </Button>

                                            <Button style={{backgroundColor:'#F7F7F7'}}
                                                    onClick={() => { this.loadStaticTableData(this.state.staticQueryParams)}}>刷新
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>

                            <Table key='staticRouteTable'
                                   rowSelection={staticRowSelection}
                                   dataSource={this.state.staticItems}
                                   columns={staticColumns}
                                   position={'both'}
                                   pagination={{
                                       showSizeChanger: true,
                                       current: this.state.staticQueryParams.pageIndex,
                                       pageSize: this.state.staticQueryParams.pageSize,
                                       onChange: this.handleStaticChangPage,
                                       onShowSizeChange: this.handleStaticChangPage,
                                       total: this.state.staticTotal,
                                       showTotal: total => `总计 ${total} 条`
                                   }}
                                   loading={this.state.staticTabLoading}
                                   onChange={this.handleStaticTableChange}
                                   bordered
                                   size={'small'}
                            />

                            <div style={{margin:'-45px 0px 0px 17px'}}>
                                <Checkbox style={{marginRight:17}} onChange={this.selectDataAll} checked={isChecked} />
                                <Button type="primary" danger disabled={!staticHasSelected}
                                        loading={this.state.delStaticLoading}
                                        onClick={() => {
                                            const content = <div>
                                                您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                                        strong>{this.state.staticSelectedRows.length}</Text>条记录吗？
                                            </div>;
                                            confirm({
                                                icon: <ExclamationCircleOutlined/>,
                                                content: content,
                                                onOk: () => {
                                                    this.batchStaticDelete()
                                                },
                                                onCancel() {

                                                },
                                            });
                                        }}>批量删除
                                </Button>
                            </div>

                            {
                                this.state.modalVisible ?
                                    <StaticRouteModal
                                        visible={this.state.modalVisible}
                                        title={this.state.modalTitle}
                                        handleOk={this.handleOk}
                                        handleCancel={this.handleCancelModal}
                                        confirmLoading={this.state.modalConfirmLoading}
                                        model={this.state.model}
                                    >

                                    </StaticRouteModal>
                                    : null
                            }
                        </TabPane>
                        <TabPane tab="网络诊断工具" key="diagnosis">
                            <Spin tip='测试中...' spinning={this.state.testLoad}>
                                <Form ref={this.diagnosisFormRef} name="diagnosis" onFinish={this.networkDetection}
                                      layout="inline">
                                    <Form.Item
                                        name='testType'
                                        style={{width:150}}
                                        rules={[
                                            {
                                                required: true,
                                                message: '请选择方式',
                                            },

                                        ]}
                                    >
                                        <Select placeholder="请选择方式" allowClear>
                                            <Option value="ping">ping</Option>
                                            <Option value="traceroute">traceroute</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="address"
                                        style={{width:330}}
                                        rules={[
                                            {
                                                required: true,
                                                message: '请输入ip地址或域名',
                                            },
                                            {
                                                pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                                message: '请输入合法的ip地址或域名'
                                            }
                                        ]}
                                    >
                                        <Input type='text' placeholder="请输入合法的ip地址或域名"/>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button htmlType="submit" style={{backgroundColor:'#F7F7F7'}}>
                                            测试
                                        </Button>
                                    </Form.Item>
                                </Form>
                                <Input.TextArea
                                    style={{width:550,marginTop:40,backgroundColor:'black',color:'white'}}
                                    autoSize={{
                                        minRows:3
                                    }}
                                    value={this.state.areaResult}
                                />
                            </Spin>
                        </TabPane>
                    </Tabs>
                </Content>
            </>
        );
    }
}

export default NetworkConfig;
