import React, {Component} from 'react';

import {
    Button,
    Card,
    Layout,
    DatePicker,
    Table,
    Typography,
    Tabs, Form, Modal, Radio,
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {download, getToken} from "../../utils/utils";
import {server} from "../../common/env";
import moment from "moment";
import {Column} from '@ant-design/charts';

const { RangePicker } = DatePicker;
const {Content} = Layout;
const {Text} = Typography;
const { TabPane } = Tabs;

class LoginReport extends Component {

    exportFormRef= React.createRef();
    exportFormRef2= React.createRef();
    exportFormRef3= React.createRef();


    state = {
        items: [],
        total: 0,
        loading: false,
        columnData:[],
        startTime:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime: moment().format("YYYY-MM-DD"),
        exportModalVisible:false,
        items2: [],
        total2: 0,
        loading2: false,
        columnData2:[],
        startTime2:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime2: moment().format("YYYY-MM-DD"),
        exportModalVisible2:false,
        items3: [],
        total3: 0,
        loading3: false,
        columnData3:[],
        startTime3:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime3: moment().format("YYYY-MM-DD"),
        exportModalVisible3:false,
    };

    componentDidMount() {
        this.getColumnData(this.state.startTime ,this.state.endTime)
        this.loadTableData(this.state.startTime ,this.state.endTime)
        this.getColumnData2(this.state.startTime ,this.state.endTime)
        this.loadTableData2(this.state.startTime ,this.state.endTime)
        this.getColumnData3(this.state.startTime ,this.state.endTime)
        this.loadTableData3(this.state.startTime ,this.state.endTime)

    }


    handleOnTabChange = () => {
        this.getColumnData(this.state.startTime ,this.state.endTime)
        this.loadTableData(this.state.startTime ,this.state.endTime)
        this.getColumnData2(this.state.startTime ,this.state.endTime)
        this.loadTableData2(this.state.startTime ,this.state.endTime)
        this.getColumnData3(this.state.startTime ,this.state.endTime)
        this.loadTableData3(this.state.startTime ,this.state.endTime)
    }

    rangePickerChange = (dates,dateStrings) =>{
        this.setState({
            startTime:dateStrings[0],
            endTime:dateStrings[1]
        })
        this.getColumnData(dateStrings[0] ,dateStrings[1])
        this.loadTableData(dateStrings[0] ,dateStrings[1])
    }

    rangePickerChange2 = (dates,dateStrings) =>{
        this.setState({
            startTime2:dateStrings[0],
            endTime2:dateStrings[1]
        })
        this.getColumnData2(dateStrings[0] ,dateStrings[1])
        this.loadTableData2(dateStrings[0] ,dateStrings[1])
    }
    rangePickerChange3 = (dates,dateStrings) =>{
        this.setState({
            startTime3:dateStrings[0],
            endTime3:dateStrings[1]
        })
        this.getColumnData3(dateStrings[0] ,dateStrings[1])
        this.loadTableData3(dateStrings[0] ,dateStrings[1])
    }

    async loadTableData(m,n) {
        this.setState({
            loading: true
        });

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.put('datast/loginreport/accountdate', {"start_time":m,"end_time":n});
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
                loading: false
            });
        }
    }
    async loadTableData2(m,n) {
        this.setState({
            loading2: true
        });

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.put('/datast/loginreport/loginmedata', {"start_time":m,"end_time":n});
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
                items2: items,
                total2: data.total,
                loading2: false
            });
        }
    }

    async loadTableData3(m,n) {
        this.setState({
            loading3: true
        });

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.put('/datast/loginreport/useripdata', {"start_time":m,"end_time":n});
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
                total3: data.total,
                loading3: false
            });
        }
    }

    getColumnData = async (m,n) => {
        let result = await request.put('/datast/loginreport/accountview', {"start_time":m,"end_time":n});
        if (result['code'] === 1) {
            this.setState({
                columnData: result['data']
            })
        }
    }
    getColumnData2 = async (m,n) => {
        let result = await request.put('/datast/loginreport/loginmeview', {"start_time":m,"end_time":n});
        if (result['code'] === 1) {
            this.setState({
                columnData2: result['data']
            })
        }
    }
    getColumnData3 = async (m,n) => {
        let result = await request.put('/datast/loginreport/useripview', {"start_time":m,"end_time":n});
        if (result['code'] === 1) {
            this.setState({
                columnData3: result['data']
            })
        }
    }

    render() {

        const columnconfig = {
            data: this.state.columnData,
            xField: 'username',
            yField: 'num',
            autoFit:true,
        };

        const columns = [{
            title: '时间',
            dataIndex: 'Daytime',
            key: 'Daytime',
            sorter: (a, b) => Date.parse(a.Daytime) - Date.parse(b.Daytime),
            defaultSortOrder: 'descend',
            sortDirections: ['ascend'],
            render: (text, record) => {
                return text
            },
        },{
            title: '用户名',
            dataIndex: 'Username',
            key: 'Username',
        },{
            title: '登录次数',
            dataIndex: 'Num',
            key: 'Num',
        }
        ];

        const columnconfig2 = {
            data: this.state.columnData2,
            xField: 'Source',
            yField: 'Num',
            autoFit:true,
        };

        const columns2 = [{
            title: '时间',
            dataIndex: 'Daytime',
            key: 'Daytime',
            render: (text, record) => {
                return text
            },
        },{
            title: 'Localhost',
            dataIndex: 'Localhost',
            key: 'Localhost',
        },{
            title: 'Radius',
            dataIndex: 'Radius',
            key: 'Radius',
        },{
            title: 'LDAP/AD',
            dataIndex: 'Ldapad',
            key: 'Ldapad',
        },{
            title: '合计',
            dataIndex: 'Num',
            key: 'Num',
        }
        ];

        const columnconfig3 = {
            data: this.state.columnData3,
            xField: 'Ip',
            yField: 'Num',
            autoFit:true,
        };

        const columns3 = [{
            title: '时间',
            dataIndex: 'Logintime',
            key: 'Logintime',
            render: (text, record) => {
                return text
            },
        },{
            title: '用户名',
            dataIndex: 'Username',
            key: 'Username',
        },{
            title: 'IP',
            dataIndex: 'Ip',
            key: 'Ip',
        },{
            title: '来源',
            dataIndex: 'Source',
            key: 'Source',
        },{
            title: '登录结果',
            dataIndex: 'Loginresult',
            key: 'Loginresult',
        }
        ];


        return (
            <>
                <Content className="site-layout-background page-content">
                    <Text italic style={{fontSize:20,color:'#666'}}>登录报表</Text>
                    <Tabs type="card" onChange={this.handleOnTabChange} style={{marginTop:20}}>
                        <TabPane tab="用户访问统计" key="1">
                            <Card
                                title="统计图"
                                extra={<Button type='link' style={{fontSize:16}} onClick={()=>{this.setState({exportModalVisible:true})}}>报表导出</Button>}
                            >
                                <RangePicker
                                    style={{width:'22%'}}
                                    format="YYYY-MM-DD"
                                    ranges={{
                                        今天: [moment(), moment()],
                                        昨天: [moment().subtract(1, 'day'), moment().subtract(1, 'day')],
                                        近一周: [moment().subtract(1, 'week'), moment()],
                                        近一月: [moment().subtract(1, 'month'), moment()],
                                        本月:[moment().startOf('month'),moment().endOf('month')],
                                        上月:[moment().subtract(1,'month').startOf('month'),moment().subtract(1,'month').endOf('month')]
                                    }}
                                    onChange={this.rangePickerChange}
                                    defaultValue={[moment().subtract(1, 'month'), moment()]}
                                />
                                <div style={{border:'1px solid rgb(221, 221, 221)',marginTop:20,height:300}}>
                                    <Column {...columnconfig} />
                                </div>

                                <Modal title="导出报表"
                                       visible={this.state.exportModalVisible}
                                       maskClosable={false}
                                       onOk={() => {
                                           this.exportFormRef.current
                                               .validateFields()
                                               .then(async values => {
                                                   let token = getToken();
                                                   let query = {
                                                       "report_name":'用户访问',
                                                       "start_time":this.state.startTime,
                                                       "end_time":this.state.endTime,
                                                       "export_type":values.export_type,
                                                       'X-Auth-Token': token
                                                   }
                                                   let queryStr = qs.stringify(query);
                                                   //文件下载操作
                                                   download(`${server}datast/export?${queryStr}`);

                                               })
                                               .catch(info => {

                                               })
                                               .finally(() => {
                                                   this.setState({
                                                       exportModalVisible: false,
                                                   })
                                               });
                                       }}
                                       onCancel={() => {
                                           this.setState({
                                               exportModalVisible: false
                                           })
                                       }}
                                       cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                >

                                    <Form ref={this.exportFormRef}>
                                        <Form.Item label="文件格式" name='export_type'>
                                            <Radio.Group>
                                                <Radio value="html">html</Radio>
                                                <Radio value="csv">csv</Radio>
                                                <Radio value="pdf">pdf</Radio>
                                                <Radio value="docx">docx</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Form>
                                </Modal>
                            </Card>

                            <Card
                                title="统计数据"
                                style={{marginTop:20}}
                            >
                                <Table
                                    dataSource={this.state.items}
                                    columns={columns}
                                    position={'both'}
                                    pagination={{
                                        total: this.state.total,
                                        showTotal: total => `总计 ${total} 条`
                                    }}
                                    loading={this.state.loading}
                                    bordered
                                    size={'small'}
                                />
                            </Card>

                        </TabPane>
                        <TabPane tab="登录方式统计" key="2">
                            <Card
                                title="统计图"
                                extra={<Button type='link' style={{fontSize:16}} onClick={()=>{this.setState({exportModalVisible2:true})}}>报表导出</Button>}
                            >
                                <RangePicker
                                    style={{width:'22%'}}
                                    format="YYYY-MM-DD"
                                    ranges={{
                                        今天: [moment(), moment()],
                                        昨天: [moment().subtract(1, 'day'), moment().subtract(1, 'day')],
                                        近一周: [moment().subtract(1, 'week'), moment()],
                                        近一月: [moment().subtract(1, 'month'), moment()],
                                        本月:[moment().startOf('month'),moment().endOf('month')],
                                        上月:[moment().subtract(1,'month').startOf('month'),moment().subtract(1,'month').endOf('month')]
                                    }}
                                    onChange={this.rangePickerChange2}
                                    defaultValue={[moment().subtract(1, 'month'), moment()]}
                                />
                                <div style={{border:'1px solid rgb(221, 221, 221)',marginTop:20,height:300}}>
                                    <Column {...columnconfig2} />
                                </div>

                                <Modal title="导出报表"
                                       visible={this.state.exportModalVisible2}
                                       maskClosable={false}
                                       onOk={() => {
                                           this.exportFormRef2.current
                                               .validateFields()
                                               .then(async values => {
                                                   let token = getToken();
                                                   let query = {
                                                       "report_name":'登录方式',
                                                       "start_time":this.state.startTime2,
                                                       "end_time":this.state.endTime2,
                                                       "export_type":values.export_type,
                                                       'X-Auth-Token': token
                                                   }
                                                   let queryStr = qs.stringify(query);
                                                   //文件下载操作
                                                   download(`${server}datast/export?${queryStr}`);

                                               })
                                               .catch(info => {

                                               })
                                               .finally(() => {
                                                   this.setState({
                                                       exportModalVisible2: false,
                                                   })
                                               });
                                       }}
                                       onCancel={() => {
                                           this.setState({
                                               exportModalVisible2: false
                                           })
                                       }}
                                       cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                >

                                    <Form ref={this.exportFormRef2}>
                                        <Form.Item label="文件格式" name='export_type'>
                                            <Radio.Group>
                                                <Radio value="html">html</Radio>
                                                <Radio value="csv">csv</Radio>
                                                <Radio value="pdf">pdf</Radio>
                                                <Radio value="docx">docx</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Form>
                                </Modal>
                            </Card>

                            <Card
                                title="统计数据"
                                style={{marginTop:20}}
                            >
                                <Table
                                    dataSource={this.state.items2}
                                    columns={columns2}
                                    position={'both'}
                                    pagination={{
                                        total: this.state.total2,
                                        showTotal: total => `总计 ${total} 条`
                                    }}
                                    loading={this.state.loading2}
                                    bordered
                                    size={'small'}
                                />
                            </Card>
                        </TabPane>
                        <TabPane tab="用户源IP访问数统计" key="3">
                            <Card
                                title="统计图"
                                extra={<Button type='link' style={{fontSize:16}} onClick={()=>{this.setState({exportModalVisible3:true})}}>报表导出</Button>}
                            >
                                <RangePicker
                                    style={{width:'22%'}}
                                    format="YYYY-MM-DD"
                                    ranges={{
                                        今天: [moment(), moment()],
                                        昨天: [moment().subtract(1, 'day'), moment().subtract(1, 'day')],
                                        近一周: [moment().subtract(1, 'week'), moment()],
                                        近一月: [moment().subtract(1, 'month'), moment()],
                                        本月:[moment().startOf('month'),moment().endOf('month')],
                                        上月:[moment().subtract(1,'month').startOf('month'),moment().subtract(1,'month').endOf('month')]
                                    }}
                                    onChange={this.rangePickerChange3}
                                    defaultValue={[moment().subtract(1, 'month'), moment()]}
                                />
                                <div style={{border:'1px solid rgb(221, 221, 221)',marginTop:20,height:300}}>
                                    <Column {...columnconfig3} />
                                </div>

                                <Modal title="导出报表"
                                       visible={this.state.exportModalVisible3}
                                       maskClosable={false}
                                       onOk={() => {
                                           this.exportFormRef3.current
                                               .validateFields()
                                               .then(async values => {
                                                   let token = getToken();
                                                   let query = {
                                                       "report_name":'用户源IP访问数',
                                                       "start_time":this.state.startTime3,
                                                       "end_time":this.state.endTime3,
                                                       "export_type":values.export_type,
                                                       'X-Auth-Token': token
                                                   }
                                                   let queryStr = qs.stringify(query);
                                                   //文件下载操作
                                                   download(`${server}datast/export?${queryStr}`);

                                               })
                                               .catch(info => {

                                               })
                                               .finally(() => {
                                                   this.setState({
                                                       exportModalVisible3: false,
                                                   })
                                               });
                                       }}
                                       onCancel={() => {
                                           this.setState({
                                               exportModalVisible3: false
                                           })
                                       }}
                                       cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                >

                                    <Form ref={this.exportFormRef3}>
                                        <Form.Item label="文件格式" name='export_type'>
                                            <Radio.Group>
                                                <Radio value="html">html</Radio>
                                                <Radio value="csv">csv</Radio>
                                                <Radio value="pdf">pdf</Radio>
                                                <Radio value="docx">docx</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Form>
                                </Modal>
                            </Card>

                            <Card
                                title="统计数据"
                                style={{marginTop:20}}
                            >
                                <Table
                                    dataSource={this.state.items3}
                                    columns={columns3}
                                    position={'both'}
                                    pagination={{
                                        total: this.state.total3,
                                        showTotal: total => `总计 ${total} 条`
                                    }}
                                    loading={this.state.loading3}
                                    bordered
                                    size={'small'}
                                />
                            </Card>
                        </TabPane>
                    </Tabs>
                </Content>
            </>
        );
    }
}

export default LoginReport;
