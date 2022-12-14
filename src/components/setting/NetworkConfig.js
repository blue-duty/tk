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
            message.success('????????????');
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
            message.error('????????????: ' + result.message, 10);
        }
    }

    async networkrestart(record) {
        const result = await request.post(`/network-config?name=${record.name}`);
        if (result['code'] === 1) {
            message.success(result.message);
            await this.loadbasicTableData();
        } else {
            message.error('??????????????????: ' + result.message, 10);
        }
    }

    showStaticDelete(record) {
        let self = this;
        confirm({
            title: '????????????????????????????',
            content: record.networkCard,
            okText: '??????',
            okType: 'danger',
            cancelText: '??????',
            onOk() {
                self.staticDelete(record);
            }
        });
    };

    showBasiRestart(record) {
        let self = this;
        this.setState({networkname:record.name})
        confirm({
            title: '????????????????????????????',
            content: record.name,
            okText: '??????',
            okType: 'danger',
            cancelText: '??????',
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
                message.error('????????????: ' + result.message, 10);
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
        // ?????? form ???????????????
        this.setState({
            modalConfirmLoading: true
        });
        if (formData.key) {
            // ??????
            const result = await request.put(`/staticroute?desAddres=${this.state.model.desAddres}&nextHop=${this.state.model.nextHop}&submask=${this.state.model.subnetMask}&networkCard=${this.state.model.networkCard}`, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false
                });
                this.loadStaticTableData(this.state.staticQueryParams);
            } else {
                message.error('????????????: ' + result.message, 10);
            }
        } else {
            // ??????
            const result = await request.post('/staticroute', formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false
                });
                this.loadStaticTableData(this.state.staticQueryParams);
            } else {
                message.error('????????????: ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    handlenetOk = async (formData) => {
        // ?????? form ???????????????
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
            message.error('????????????: ' + result.message, 10);
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
            title: '????????????',
            dataIndex: 'networkCard',
            key: 'networkCard',
        }, {
            title: '????????????',
            dataIndex: 'desAddres',
            key: 'desAddres',
        }, {
            title: '????????????',
            dataIndex: 'subnetMask',
            key: 'subnetMask',
        },{
            title: '???????????????',
            dataIndex: 'nextHop',
            key: 'nextHop',
        },{
            title: '??????',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={()=>this.showModal('??????', record)}>??????</Button>

                        <Button type="text" size='small' danger
                                onClick={() => this.showStaticDelete(record)}>??????</Button>
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
            title: '????????????',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'IP??????',
            dataIndex: 'ip',
            key: 'ip',
        }, {
            title: '??????',
            dataIndex: 'gateway',
            key: 'gateway',
        },{
            title: '????????????',
            dataIndex: 'netmask',
            key: 'netmask',
        },{
            title: '??????',
            dataIndex: 'status',
            key: 'status',
            render: text => {
                if (text==='yes') {
                    return '??????'
                } else {
                    return '??????'
                }
            }
        },{
            title: '??????',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={()=>this.shownetModal('??????', record)}>??????</Button>

                        <Button type="text" size='small' danger disabled={record.status!=='yes'}
                                onClick={() => this.showBasiRestart(record)}>????????????</Button>
                    </div>
                )
            },
        }
        ];


        return (
            <>
                <Content className="site-layout-background page-content">

                    <Tabs tabPosition={'top'} type="card" onChange={this.handleOnTabChange} tabBarStyle={{width: '100%'}}>

                        <TabPane tab="?????????????????? " key="rdp">

                            <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                <Col span={14} key={1}>
                                    <Text italic style={{fontSize:20,color:'#666'}}>????????????</Text>
                                </Col>
                                <Col span={10} key={2} style={{textAlign: 'right'}}>
                                    <Space>
                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => { this.loadbasicTableData()}}>??????
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
                                    <Text italic style={{fontSize:20,color:'#666'}}>DNS??????</Text>
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
                                            message: '?????????dns',
                                        },
                                        {
                                            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                            message: '??????????????????dns'
                                        }
                                    ]}
                                >
                                    <Input type='text' placeholder="??????????????????dns"/>
                                </Form.Item>

                                <Form.Item
                                    name="standby_dns"
                                    label="??????DNS"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                        {
                                            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                            message: '????????????????????????DNS'
                                        }
                                    ]}
                                >
                                    <Input type='text' />
                                </Form.Item>


                                <Form.Item>
                                    <Button  type="primary" htmlType="submit">
                                        ??????
                                    </Button>
                                </Form.Item>
                            </Form>

                        </TabPane>
                        <TabPane tab="????????????" key="staticRoute">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.staticFormRef} name="staticForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="desAddres"
                                                label="????????????"
                                            >
                                                <Input type='text' placeholder="?????????????????????" />
                                            </Form.Item>

                                            <Form.Item {...formTailLayout} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    ??????
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {
                                                            this.staticFormRef.current.resetFields();
                                                            this.loadStaticTableData({
                                                                pageIndex: 1,
                                                                pageSize: 10,
                                                            })
                                                        }}>????????????
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Col>
                                    <Col span={10} key={2} style={{textAlign: 'right'}}>
                                        <Space>

                                            <Button type="primary"
                                                    onClick={() => this.showModal('??????',{})}>??????
                                            </Button>

                                            <Button style={{backgroundColor:'#F7F7F7'}}
                                                    onClick={() => { this.loadStaticTableData(this.state.staticQueryParams)}}>??????
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
                                       showTotal: total => `?????? ${total} ???`
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
                                                ???????????????????????????<Text style={{color: '#1890FF'}}
                                                                        strong>{this.state.staticSelectedRows.length}</Text>???????????????
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
                                        }}>????????????
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
                        <TabPane tab="??????????????????" key="diagnosis">
                            <Spin tip='?????????...' spinning={this.state.testLoad}>
                                <Form ref={this.diagnosisFormRef} name="diagnosis" onFinish={this.networkDetection}
                                      layout="inline">
                                    <Form.Item
                                        name='testType'
                                        style={{width:150}}
                                        rules={[
                                            {
                                                required: true,
                                                message: '???????????????',
                                            },

                                        ]}
                                    >
                                        <Select placeholder="???????????????" allowClear>
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
                                                message: '?????????ip???????????????',
                                            },
                                            {
                                                pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^(http(s)?:\/\/)?(www\.)?([0-9a-z-]{1,}.)?[0-9a-z-]{2,}.([0-9a-z-]{2,}.)?[a-z]{2,}$/i,
                                                message: '??????????????????ip???????????????'
                                            }
                                        ]}
                                    >
                                        <Input type='text' placeholder="??????????????????ip???????????????"/>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button htmlType="submit" style={{backgroundColor:'#F7F7F7'}}>
                                            ??????
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
