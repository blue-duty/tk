import React, {Component} from 'react';

import {
    Button,
    Card,
    Layout,
    DatePicker,
    Table,
    Typography,
    Tabs, Form, Modal, Radio, Col, Row,
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {download, getToken} from "../../utils/utils";
import {server} from "../../common/env";
import moment from "moment";
import {Line,Column} from '@ant-design/charts';

const { RangePicker } = DatePicker;
const {Content} = Layout;
const {Text} = Typography;
const { TabPane } = Tabs;

class OperationReport extends Component {

    exportFormRef= React.createRef()
    exportFormRef4= React.createRef()
    exportFormRef2= React.createRef()
    exportFormRef3= React.createRef()
    exportFormRef5= React.createRef()

    state = {
        items: [],
        total: 0,
        loading: false,
        lineData:[],
        startTime:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime: moment().format("YYYY-MM-DD"),
        exportModalVisible:false,
        //4
        items4: [],
        total4: 0,
        loading4: false,
        lineData4:[],
        startTime4:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime4: moment().format("YYYY-MM-DD"),
        exportModalVisible4:false,
        timeType:'天',
        //2
        items2: [],
        total2: 0,
        loading2: false,
        lineData2:[],
        startTime2:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime2: moment().format("YYYY-MM-DD"),
        exportModalVisible2:false,
        //3
        items3: [],
        total3: 0,
        loading3: false,
        columnData3:[],
        startTime3:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime3: moment().format("YYYY-MM-DD"),
        exportModalVisible3:false,
        //5
        items5: [],
        total5: 0,
        loading5: false,
        columnData5:[],
        startTime5:moment().subtract(1, 'month').format("YYYY-MM-DD"),
        endTime5: moment().format("YYYY-MM-DD"),
        exportModalVisible5:false,
    };

    componentDidMount() {
        this.geLineData(this.state.startTime ,this.state.endTime)
        this.loadTableData(this.state.startTime ,this.state.endTime)
        this.geLineData4(this.state.startTime ,this.state.endTime)
        this.loadTableData4(this.state.startTime ,this.state.endTime)
        this.geLineData2(this.state.startTime ,this.state.endTime)
        this.loadTableData2(this.state.startTime ,this.state.endTime)
        this.getColumnData3(this.state.startTime ,this.state.endTime)
        this.loadTableData3(this.state.startTime ,this.state.endTime)
        this.getColumnData5(this.state.startTime ,this.state.endTime)
        this.loadTableData5(this.state.startTime ,this.state.endTime)
    }

    rangePickerChange = (dates,dateStrings) =>{
        this.setState({
            startTime:dateStrings[0],
            endTime:dateStrings[1]
        })
        this.geLineData(dateStrings[0] ,dateStrings[1])
        this.loadTableData(dateStrings[0] ,dateStrings[1])
    }

    rangePickerChange2 = (dates,dateStrings) =>{
        this.setState({
            startTime2:dateStrings[0],
            endTime2:dateStrings[1]
        })
        this.geLineData2(dateStrings[0] ,dateStrings[1])
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
    rangePickerChange5 = (dates,dateStrings) =>{
        this.setState({
            startTime5:dateStrings[0],
            endTime5:dateStrings[1]
        })
        this.getColumnData5(dateStrings[0] ,dateStrings[1])
        this.loadTableData5(dateStrings[0] ,dateStrings[1])
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
            let result = await request.put('datast/operareport/assetssdata', {"start_time":m,"end_time":n});
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
            let result = await request.put('datast/operareport/protocoldata', {"start_time":m,"end_time":n});
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
            let result = await request.put('datast/operareport/sessiondata', {"start_time":m,"end_time":n});
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

    async loadTableData5(m,n) {
        this.setState({
            loading5: true
        });

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.put('datast/operareport/commanddata', {"start_time":m,"end_time":n});
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
                items5: items,
                total5: data.total,
                loading5: false
            });
        }
    }
    geLineData = async (m,n) => {
        let result = await request.put('datast/operareport/assetssview', {"start_time":m,"end_time":n});
        if (result['code'] === 1) {
            this.setState({
                lineData: result['data']
            })
        }
    }

    geLineData2 = async (m,n) => {
        let result = await request.put('datast/operareport/protocolview', {"start_time":m,"end_time":n});
        if (result['code'] === 1) {
            this.setState({
                lineData2: result['data']
            })
        }
    }

    getColumnData3 = async (m,n) => {
        let result = await request.put('datast/operareport/sessionview', {"start_time":m,"end_time":n});
        if (result['code'] === 1) {
            this.setState({
                columnData3: result['data']
            })
        }
    }

    getColumnData5 = async (m,n) => {
        let result = await request.put('datast/operareport/commandview', {"start_time":m,"end_time":n});
        if (result['code'] === 1) {
            this.setState({
                columnData5: result['data']
            })
        }
    }


    rangePickerChange4 = (dates,dateStrings) =>{
        this.setState({
            startTime4:dateStrings[0],
            endTime4:dateStrings[1]
        })
        this.geLineData4(dateStrings[0] ,dateStrings[1])
        this.loadTableData4(dateStrings[0] ,dateStrings[1])
    }

    async loadTableData4(m,n) {
        this.setState({
            loading4: true
        });

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.put('datast/operareport/operadata', {"start_time":m,"end_time":n});
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
                items4: items,
                total4: data.total,
                loading4: false
            });
        }
    }

    geLineData4 = async (m,n,t='天') => {
        let result = await request.put('datast/operareport/operaview', {"start_time":m,"end_time":n,"time_type":t});
        if (result['code'] === 1) {
            this.setState({
                lineData4: result['data']
            })
        }
    }

    handleOnTabChange = () => {
        this.geLineData(this.state.startTime ,this.state.endTime)
        this.loadTableData(this.state.startTime ,this.state.endTime)
        this.geLineData4(this.state.startTime ,this.state.endTime)
        this.loadTableData4(this.state.startTime ,this.state.endTime)
        this.geLineData2(this.state.startTime ,this.state.endTime)
        this.loadTableData2(this.state.startTime ,this.state.endTime)
        this.getColumnData3(this.state.startTime ,this.state.endTime)
        this.loadTableData3(this.state.startTime ,this.state.endTime)
        this.getColumnData5(this.state.startTime ,this.state.endTime)
        this.loadTableData5(this.state.startTime ,this.state.endTime)
    }

    render() {
        const data = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                res.push({"day":item['Daytime'],"count":Number(item['Asset']),"category":"主机数"})
                res.push({"day":item['Daytime'],"count":Number(item['Usersum']),"category":"用户数"})
            })
            return res
        }

        const data2 = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                res.push({"day":item['Daytime'],"count":Number(item['Rdp']),"category":"RDP"})
                res.push({"day":item['Daytime'],"count":Number(item['Ssh']),"category":"SSH"})
                res.push({"day":item['Daytime'],"count":Number(item['Vnc']),"category":"VNC"})
                res.push({"day":item['Daytime'],"count":Number(item['Telnet']),"category":"TELNET"})
                res.push({"day":item['Daytime'],"count":Number(item['Application']),"category":"应用"})
                res.push({"day":item['Daytime'],"count":Number(item['Nums']),"category":"合计"})
            })
            return res
        }

        const config = {
            data: data(this.state.lineData),
            xField: 'day',
            yField: 'count',
            seriesField: 'category',
            autoFit:true,
        };

        const config2 = {
            data: data2(this.state.lineData2),
            xField: 'day',
            yField: 'count',
            seriesField: 'category',
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
            title: '主机',
            dataIndex: 'Asset',
            key: 'Asset',
        },{
            title: '用户',
            dataIndex: 'Usersum',
            key: 'Usersum',
        }
        ];

        const columns2 = [{
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
            title: 'RDP',
            dataIndex: 'Rdp',
            key: 'Rdp',
        },{
            title: 'SSH',
            dataIndex: 'Ssh',
            key: 'Ssh',
        },{
            title: 'VNC',
            dataIndex: 'Vnc',
            key: 'Vnc',
        },{
            title: 'TELNET',
            dataIndex: 'Telnet',
            key: 'Telnet',
        },{
            title: '应用',
            dataIndex: 'Application',
            key: 'Application',
        },{
            title: '合计',
            dataIndex: 'Nums',
            key: 'Nums',
        }
        ];


        const columnconfig3 = {
            data: this.state.columnData3,
            xField: 'Daytime',
            yField: 'Total',
            autoFit:true,
        };

        const columns3 = [{
            title: '主机名称',
            dataIndex: 'Name',
            key: 'Name',
        },{
            title: '主机IP',
            dataIndex: 'Ip',
            key: 'Ip',
        },{
            title: '用户名',
            dataIndex: 'Username',
            key: 'Username',
        },{
            title: '协议',
            dataIndex: 'Protocol',
            key: 'Protocol',
        },{
            title: '连接时间',
            dataIndex: 'Conntime',
            key: 'Conntime',
            sorter: (a, b) => Date.parse(a.Conntime) - Date.parse(b.Conntime),
            defaultSortOrder: 'descend',
            sortDirections: ['ascend'],
            render: (text, record) => {
                return text
            },
        },{
            title: '断开时间',
            dataIndex: 'Disconntime',
            key: 'Disconntime',
            sorter: (a, b) => Date.parse(a.Disconnectedtime) - Date.parse(b.Disconnectedtime),
            defaultSortOrder: 'descend',
            sortDirections: ['ascend'],
            render: (text, record) => {
                return text
            },
        },
        ];

        const columnconfig5 = {
            data: this.state.columnData5,
            xField: 'Name',
            yField: 'Num',
            autoFit:true,
            xAxis: {
                label: {
                    formatter: function (params) {
                        var newParamsName = "";
                        var paramsNameNumber = params.length;
                        var provideNumber = 6;
                        var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
                        if (paramsNameNumber > provideNumber) {
                            for (var p = 0; p < rowNumber; p++) {
                                var tempStr = "";
                                var start = p * provideNumber;
                                var end = start + provideNumber;
                                if (p === rowNumber - 1) {
                                    tempStr = params.substring(start, paramsNameNumber);
                                } else {
                                    tempStr = params.substring(start, end) + "\n";
                                }
                                newParamsName += tempStr;
                            }
                        } else {
                            newParamsName = params;
                        }
                        return newParamsName;
                    }
                },
            },
        };

        const columns5 = [{
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
            title: '命令',
            dataIndex: 'Name',
            key: 'Name',
        },{
            title: '协议',
            dataIndex: 'Protocol',
            key: 'Protocol',
        },{
            title: '用户',
            dataIndex: 'Accountname',
            key: 'Accountname',
        },{
            title: '主机IP',
            dataIndex: 'Ip',
            key: 'Ip',
        },{
            title: '来源IP',
            dataIndex: 'Sourceip',
            key: 'Sourceip',
        },
        ];

        const data4 = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                for(const [key,value] of Object.entries(item)){
                    if(key==="time"){
                    }else {
                        res.push({"day":item['time'],"count":Number(value),"protocol":key})
                    }
                }
            })
            return res
        }

        const config4 = {
            data: data4(this.state.lineData4),
            xField: 'day',
            yField: 'count',
            seriesField: 'protocol',
            autoFit:true
        };

        const columnconfig = {
            data: this.state.lineData4,
            xField: 'time',
            yField: '登录次数',
            autoFit:true,
        };

        const columns4 = [{
            title: '主机名称',
            dataIndex: 'Name',
            key: 'Name',
        },{
            title: '用户名',
            dataIndex: 'Username',
            key: 'Username',
        },{
            title: '协议',
            dataIndex: 'Protocol',
            key: 'Protocol',
        },{
            title: '连接时间',
            dataIndex: 'Connectedtime',
            key: 'Connectedtime',
            sorter: (a, b) => Date.parse(a.Connectedtime) - Date.parse(b.Connectedtime),
            defaultSortOrder: 'descend',
            sortDirections: ['ascend'],
            render: (text, record) => {
                return text
            },
        },{
            title: '断开时间',
            dataIndex: 'Disconnectedtime',
            key: 'Disconnectedtime',
            sorter: (a, b) => Date.parse(a.Disconnectedtime) - Date.parse(b.Disconnectedtime),
            defaultSortOrder: 'descend',
            sortDirections: ['ascend'],
            render: (text, record) => {
                return text
            },
        },
        ];



        return (
            <>
                <Content className="site-layout-background page-content">
                    <Text italic style={{fontSize:20,color:'#666'}}>运维报表</Text>
                    <Tabs type="card" onChange={this.handleOnTabChange} style={{marginTop:20}}>
                        <TabPane tab="主机访问统计" key="1">
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
                                    <Line {...config} />
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
                                                       "report_name":'主机访问',
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
                        <TabPane tab="协议访问统计" key="2">
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
                                    <Line {...config2} />
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
                                                       "report_name":'协议访问',
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
                        <TabPane tab="会话时长统计" key="3">
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
                                                       "report_name":'会话时长',
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
                        <TabPane tab="运维时间分布统计" key="4">
                            <Card
                                title="统计图"
                                extra={<Button type='link' style={{fontSize:16}} onClick={()=>{this.setState({exportModalVisible4:true})}}>报表导出</Button>}
                            >
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}}>
                                    <Col span={14} key={1}>
                                        <RangePicker
                                            style={{width:'38%'}}
                                            format="YYYY-MM-DD"
                                            ranges={{
                                                今天: [moment(), moment()],
                                                昨天: [moment().subtract(1, 'day'), moment().subtract(1, 'day')],
                                                近一周: [moment().subtract(1, 'week'), moment()],
                                                近一月: [moment().subtract(1, 'month'), moment()],
                                                本月:[moment().startOf('month'),moment().endOf('month')],
                                                上月:[moment().subtract(1,'month').startOf('month'),moment().subtract(1,'month').endOf('month')]
                                            }}
                                            onChange={this.rangePickerChange4}
                                            defaultValue={[moment().subtract(1, 'month'), moment()]}
                                        />
                                    </Col>
                                    <Col span={10} key={2} style={{textAlign: 'right'}}>
                                        <Button style={{backgroundColor:'#F7F7F7',marginRight:2,fontSize:14}}
                                                onClick={()=>{
                                                    this.setState({timeType:'小时'})
                                                    this.geLineData4(this.state.startTime4,this.state.endTime4,"小时")
                                                }}>小时</Button>

                                        <Button style={{backgroundColor:'#F7F7F7',marginRight:2,fontSize:14}}
                                                onClick={()=>{
                                                    this.setState({timeType:'天'})
                                                    this.geLineData4(this.state.startTime4 ,this.state.endTime4,"天")
                                                }}>天</Button>

                                        <Button style={{backgroundColor:'#F7F7F7',marginRight:2,fontSize:14}}
                                                onClick={()=>{
                                                    this.setState({timeType:'周'})
                                                    this.geLineData4(this.state.startTime4 ,this.state.endTime4,"周")
                                                }}>周</Button>

                                        <Button style={{backgroundColor:'#F7F7F7',fontSize:14}}
                                                onClick={()=>{
                                                    this.setState({timeType:'月'})
                                                    this.geLineData4(this.state.startTime ,this.state.endTime,'月')
                                                }}>月</Button>
                                    </Col>
                                </Row>

                                <div style={{border:'1px solid rgb(221, 221, 221)',marginTop:20,height:300}}>
                                    {
                                        this.state.timeType ==='小时'? <Column {...columnconfig} /> :<Line {...config4} />
                                    }
                                </div>

                                <Modal title="导出报表"
                                       visible={this.state.exportModalVisible4}
                                       maskClosable={false}
                                       onOk={() => {
                                           this.exportFormRef4.current
                                               .validateFields()
                                               .then(async values => {
                                                   let token = getToken();
                                                   let query = {
                                                       "report_name":'运维时间分布',
                                                       "start_time":this.state.startTime4,
                                                       "end_time":this.state.endTime4,
                                                       "export_type":values.export_type,
                                                       "time_type":this.state.timeType,
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
                                                       exportModalVisible4: false,
                                                   })
                                               });
                                       }}
                                       onCancel={() => {
                                           this.setState({
                                               exportModalVisible4: false
                                           })
                                       }}
                                       cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                >

                                    <Form ref={this.exportFormRef4}>
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
                                    dataSource={this.state.items4}
                                    columns={columns4}
                                    position={'both'}
                                    pagination={{
                                        total: this.state.total4,
                                        showTotal: total => `总计 ${total} 条`
                                    }}
                                    loading={this.state.loading4}
                                    bordered
                                    size={'small'}
                                />
                            </Card>
                        </TabPane>
                        <TabPane tab="命令统计" key="5">
                            <Card
                                title="统计图"
                                extra={<Button type='link' style={{fontSize:16}} onClick={()=>{this.setState({exportModalVisible5:true})}}>报表导出</Button>}
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
                                    onChange={this.rangePickerChange5}
                                    defaultValue={[moment().subtract(1, 'month'), moment()]}
                                />
                                <div style={{border:'1px solid rgb(221, 221, 221)',marginTop:20,height:300}}>
                                    <Column {...columnconfig5} />
                                </div>

                                <Modal title="导出报表"
                                       visible={this.state.exportModalVisible5}
                                       maskClosable={false}
                                       onOk={() => {
                                           this.exportFormRef5.current
                                               .validateFields()
                                               .then(async values => {
                                                   let token = getToken();
                                                   let query = {
                                                       "report_name":'命令统计',
                                                       "start_time":this.state.startTime5,
                                                       "end_time":this.state.endTime5,
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
                                                       exportModalVisible5: false,
                                                   })
                                               });
                                       }}
                                       onCancel={() => {
                                           this.setState({
                                               exportModalVisible5: false
                                           })
                                       }}
                                       cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                >

                                    <Form ref={this.exportFormRef5}>
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
                                    dataSource={this.state.items5}
                                    columns={columns5}
                                    position={'both'}
                                    pagination={{
                                        total: this.state.total5,
                                        showTotal: total => `总计 ${total} 条`
                                    }}
                                    loading={this.state.loading5}
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

export default OperationReport;
