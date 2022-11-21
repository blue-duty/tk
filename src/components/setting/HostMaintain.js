import React, {Component} from 'react';
import {
    Button,
    Form,
    Input,
    Layout,
    Switch,
    Tabs,
    Typography,
    Divider,
    Spin,
    Space,
    Row,
    Col,
    Table,
    Modal,
    DatePicker,
    Upload, notification, Checkbox, Card, Radio
} from "antd";
import request from "../../common/request";
import {message} from "antd/es";
import {ExclamationCircleOutlined, UploadOutlined,  DownOutlined, UpOutlined} from "@ant-design/icons";
import logo from "../../favicon.ico"
import axios from "axios";
import {download, getHeaders, getToken, renderSize} from "../../utils/utils";
import qs from "qs";
import {server} from "../../common/env";
import moment from "moment";
import {Line} from "@ant-design/charts";

const {Content} = Layout;
const {TabPane} = Tabs;
const {Text} = Typography;
const confirm = Modal.confirm;
const { RangePicker } = DatePicker;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 8},
};
const formTailLayout = {
    wrapperCol:{ offset: 0, span:18 }
};
const formItemLayout2 = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout2 = {
    wrapperCol:{ offset: 3, span:18 }
};


class HostMaintain extends Component {

    state = {
        properties: {},
        loading:false,
        load:false,
        items: [],
        total: 0,
        tabLoading:false,
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        selectedRowKeys: [],
        fileList: [],
        sysLog: [],
        accessLog: [],
        delBtnLoading: false,
        currentName: undefined,
        startTime:'',//开始时间
        endTime:'',  //结束时间
        importModalVisible: false,
        restoreLoad: false,
        currentLoad: false,
        display:'none',
        judge:'down',
        lineData:[],
        items2: [],
        loading2:false,
    }

    timeSettingFormRef = React.createRef();
    sysTimeFormRef = React.createRef();
    renameFormRef = React.createRef();
    backupFormRef = React.createRef();
    accessFormRef = React.createRef();


    componentDidMount() {

        // eslint-disable-next-line no-extend-native
        String.prototype.bool = function () {
            return (/^true$/i).test(this);
        };

        this.getTimeProperties();
        this.getSysTimeProperties();
        this.getSysVersion();
        this.loadTableData();
        this.getSysLog();
        this.getAccessLog();
        this.systemUsage();
        this.interval = setInterval(() => this.systemUsage(), 5000);
        this.getMode();
    }

    changeTimeProperties = async (values) => {
        let result = await request.put('/time-sync', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    getTimeProperties = async () => {

        let result = await request.get('/time-sync');
        if (result['code'] === 1) {
            let timeproperties = result['data'];

            for (let key in timeproperties) {
                if (key === 'ntpConfig'){
                    timeproperties[key] = timeproperties[key].bool();
                }
            }

            this.setState({
                timeproperties: timeproperties
            })

            if (this.timeSettingFormRef.current) {
                this.timeSettingFormRef.current.setFieldsValue(timeproperties)
            }
        } else {
            message.error(result['message']);
        }
    }

    getSysTimeProperties = async () => {
        let result = await request.get('/time-sync-current');
        if (result['code'] === 1) {
            let currentTime = result['data']['modTime'];
            const formData = new FormData();
            formData.modTime = moment(currentTime,"YYYY-MM-DD HH:mm:ss")
            if (this.sysTimeFormRef.current) {
                this.sysTimeFormRef.current.setFieldsValue(formData)
            }
        } else {
            message.error(result['message']);
        }
    }

    getSysLog = async () => {
        let result = await request.get('/log/syslog');
        if (result['code'] === 1) {
            let sysLog = result['data'];
            this.setState({
                sysLog: sysLog
            })
        } else {
            let sysLog = "暂无日志";
            this.setState({
                sysLog: sysLog
            })
        }
    }

    getAccessLog = async () => {
        let result = await request.get('/log/guacd');
        if (result['code'] === 200) {
            let accessLog = result['data'];
            this.setState({
                accessLog: accessLog
            })

        } else {
            let accessLog = "暂无日志";
            this.setState({
                accessLog: accessLog
            })
        }
    }

    getMode = async () => {
        let result = await request.get('/operation-mode');
        if (result['code'] === 1) {
            if (this.accessFormRef.current) {
                this.accessFormRef.current.setFieldsValue(result['data'])
            }
        } else {
            message.error(result['message']);
        }
    }

    changeMode = async (value) =>{
        this.setState({loading2:true})
        if(value['enable-debug']==='true'){
            this.setState({tip2:"调试模式启用中..."})
        }else {
            this.setState({tip2:"调试模式禁用中..."})
        }
        let result = await request.put(`/operation-mode?status=${value['enable-debug']}`);
        if (result.code === 1) {
            this.setState({loading2:false})
            message.success(result.message);
            await this.getAccessLog()
        } else {
            this.setState({loading2:false})
            message.error(result.message);
            await this.getAccessLog()
        }
    }

    changeSysTime = async (value) => {
        const fieldsValue = {
            "modTime":value['modTime'].format('YYYY-MM-DD HH:mm:ss'),
        }
        let result = await request.put('/time-sync-modify',fieldsValue);
        if (result.code === 1) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    }

    setTimeSync = async () =>{
        this.setState({ loading : true })
        let result = await request.put('/time-sync-immediately');
        if (result.code === 1) {
            this.setState({ loading : false })
            await this.getSysTimeProperties()
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    }

    getSysVersion = async () => {
        let result = await request.get('/sys-version');
        if (result.code !== 1) {
            message.error(result.message);
            return;
        }
        this.setState({
            version: result['data']['version']
        })
    }

    sysReboot = async () => {
        this.setState({
            load : true,
            tip:'重启中...'
        })
        axios.put('/sys-reboot',"",{headers: getHeaders(),timeout:1000*20})
            .then((response) => {
                this.setState({load : false})
                message.error("重启失败");
            })
            .catch((error) => {
                if (error.response === undefined ) {
                    window.location.href = '#/login';
                }
            });
    }

    sysShutdown = async () => {
        this.setState({
            load : true,
            tip:'关机中...'
        })
        axios.put('/sys-shutdown',"",{headers: getHeaders(),timeout:1000*20})
            .then((response) => {
                this.setState({load : false})
                message.error("关机失败");
            })
            .catch((error) => {
                if (error.response === undefined ) {
                    window.location.href = '#/login';
                }
            });
    }
    //查看所有备份
    async loadTableData(queryParams) {
        this.setState({
            tabLoading: true
        });

        queryParams = queryParams || this.state.queryParams;

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = []

        try {
            let result = await request.get('/backup/paging?' + paramsStr);
            if (result['code'] === 1) {
                data = result['data'];
            } else {
                message.error(result['message']);
            }
        } catch (e) {

        } finally {
            const items = data.map(item => {
                return {'key': item['name'], ...item}
            })
            this.setState({
                items: items,
                total: data.length,
                queryParams: queryParams,
                tabLoading: false
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

    async backupImport(name) {
        this.setState({restoreLoad: true})
        const result = await request.post(`/backup/import?backupFile=${name}`);
        if (result['code'] === 1) {
            this.setState({restoreLoad: false})
            message.success(result.message);
        } else {
            this.setState({restoreLoad: false})
            message.error('恢复失败: ' + result.message, 10);
        }

    }
    //恢复
    showRestoreConfirm(name) {
        let self = this;
        confirm({
            title: '该操作会丢失当前数据，您确定要恢复此项配置吗?',
            content: name,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.backupImport(name);
            }
        });
    };
    //重命名
    handleRename = async (formData) => {
        formData.oldName = this.state.currentName
        let paramStr = qs.stringify(formData);
        const result = await request.post(`/backup/rename?${paramStr}`);
        if (result.code === 1) {
            message.success(result.message);
            this.setState({
                renameVisible: false
            });
            await this.loadTableData(this.state.queryParams);
        } else {
            message.error('操作失败: ' + result.message, 10);
        }
    };
    //导出
    handleExport = async (name) => {
        let token = getToken();
        let query = {
            'backupFile': name,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}backup/exportFile?${queryStr}`);
    };

    async delete(name) {
        const result = await request.delete(`/backup/rm?backupFile=${name}`);
        if (result['code'] === 1) {
            message.success('删除成功');
            await this.loadTableData(this.state.queryParams);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }

    }
    //删除
    showDeleteConfirm(name) {
        let self = this;
        confirm({
            title: '您确定要删除此项备份文件吗?',
            content: name,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(name);
            }
        });
    };
    //批量删除
    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete(`/backup/rm?backupFile=${this.state.selectedRowKeys.join(',')}`);
            if (result.code === 1) {
                message.success(result.message, 3);
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

    handleTableChange = async (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        await this.loadTableData(query);
    }

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
    //备份当前配置
    backupExport = async () => {
        this.setState({currentLoad: true})
        let result = await request.get('/backup/export');
        if (result.code === 1) {
            this.setState({currentLoad: false})
            this.loadTableData();
            message.success(result.message);
        }else {
            this.setState({currentLoad: false})
            message.error(result.message);
        }
    }
    //恢复出厂设置
    backupReset = async () => {
        let result = await request.post('/backup/reset');
        if (result.code === 1) {
            message.success(result.message);
        }else {
            message.error(result.message);
        }
    }

    //导出系统日志
    ExportSysLog = async () =>{
        let token = getToken();
        let query = {
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}log/syslog/export?${queryStr}`);
    }

    //导出主机连接日志
    ExportGuacdLog = async () =>{
        let token = getToken();
        let query = {
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}log/guacd/export?${queryStr}`);
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

    //系统使用率
    systemUsage = async () => {
        let result = await request.get('/systemuti');
        if (result['code'] === 1) {
            const items = result.data.slice(-1).map(item => {
                return {'key': item['time'], ...item}
            })
            this.setState({
                lineData: result['data'],
                items2: items,
            });
        }
    }


    handleOnTabChange = () => {
        this.getTimeProperties()
        this.getSysTimeProperties()
        this.getSysVersion()
        this.loadTableData();
        this.getSysLog()
        this.getAccessLog()
        this.systemUsage()
        this.getMode();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const data = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                res.push({"day":item['time'],"count":Number(item['cpu_surplus']),"category":"cpu未使用率"})
                res.push({"day":item['time'],"count":Number(item['cpu_use']),"category":"cpu使用率"})
            })
            return res
        }

        const config = {
            data: data(this.state.lineData),
            xField: 'day',
            yField: 'count',
            seriesField: 'category',
            autoFit:true,
            yAxis: {
                label: {
                    // 数值格式化为千分位
                    formatter: (v) => `${v}%`
                },
            },
        };

        const data2 = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                res.push({"day":item['time'],"count":Number(item['mem_surplus']),"category":"内存未使用率"})
                res.push({"day":item['time'],"count":Number(item['mem_use']),"category":"内存使用率"})
            })
            return res
        }

        const config2 = {
            data: data2(this.state.lineData),
            xField: 'day',
            yField: 'count',
            seriesField: 'category',
            autoFit:true,
            yAxis: {
                label: {
                    // 数值格式化为千分位
                    formatter: (v) => `${v}%`
                },
            },
        };

        const data3 = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                res.push({"day":item['time'],"count":Number(item['io_read']),"category":"磁盘读速率"})
                res.push({"day":item['time'],"count":Number(item['io_write']),"category":"磁盘写速率"})
            })
            return res
        }

        const config3 = {
            data: data3(this.state.lineData),
            xField: 'day',
            yField: 'count',
            seriesField: 'category',
            autoFit:true,
            yAxis: {
                label: {
                    // 数值格式化为千分位
                    formatter: (v) => `${v}MByte/s`
                },
            },
        };

        const data4 = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                res.push({"day":item['time'],"count":Number(item['disk']),"category":"数据盘占用率"})
            })
            return res
        }

        const config4 = {
            data: data4(this.state.lineData),
            xField: 'day',
            yField: 'count',
            seriesField: 'category',
            autoFit:true,
            yAxis: {
                label: {
                    // 数值格式化为千分位
                    formatter: (v) => `${v}%`
                },
            },
        };

        const columns2 = [{
            title: 'cpu使用率',
            dataIndex: 'cpu_useta',
            key: 'cpu_useta',
        },{
            title: '内存使用率',
            dataIndex: 'mem_useta',
            key: 'mem_useta',

        },{
            title: '磁盘读速率',
            dataIndex: 'io_writete',
            key: 'io_writete',
        },{
            title: '磁盘写速率',
            dataIndex: 'io_readte',
            key: 'io_readte',
        },{
            title: '数据盘占用率',
            dataIndex: 'diskta',
            key: 'diskta',
        }
        ];

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
                                onClick={() => this.showRestoreConfirm(record.name)}>恢复</Button>

                        <Button type="link" size='small'
                                onClick={()=>{
                                    this.setState({
                                        renameVisible: true,
                                        currentName: record.name
                                    })
                                }}>重命名</Button>

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
                <Content className="site-layout-background page-content">

                    <Tabs tabPosition={'top'} type="card" onChange={this.handleOnTabChange} tabBarStyle={{width: '100%'}}>

                        <TabPane tab="系统时间" key="time">
                            <Spin tip='同步中...' spinning={this.state.loading}>
                                <Form ref={this.sysTimeFormRef} name="sysTimeForm" onFinish={this.changeSysTime}
                                      layout="horizontal" labelAlign="left">
                                    <Form.Item
                                        {...formItemLayout}
                                        name="modTime"
                                        label="当前时间"
                                        rules={[{required: true}]}
                                    >
                                        <DatePicker showTime showNow={false} format="YYYY-MM-DD HH:mm:ss" onOk={()=>{this.sysTimeFormRef.current.submit()}} />
                                    </Form.Item>
                                </Form>
                                <Divider />
                                <Form ref={this.timeSettingFormRef} name="time" onFinish={this.changeTimeProperties}
                                      layout="horizontal" labelAlign="left">

                                    <Form.Item
                                        {...formItemLayout}
                                        name="ntpConfig"
                                        label="开启时间同步"
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="ntpServer"
                                        label="npt服务器"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'npt服务器',
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder="请输入npt服务器地址"/>
                                    </Form.Item>

                                    <Form.Item {...formTailLayout}>
                                        <Button style={{marginRight:75,backgroundColor:'#F7F7F7'}} onClick={this.setTimeSync}>立即同步</Button>
                                        <Button type="primary" htmlType="submit">
                                            更新
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Spin>
                        </TabPane>
                        <TabPane tab="系统版本信息" key="safeguard">
                            <div style={{marginTop:27,fontSize:16}}>
                                <img style={{width:25,height:25}} src={logo} alt=""/> TOM 创旗运维安全管理系统
                            </div>
                            <div style={{marginTop:30,marginBottom:50}}>
                                版本：<span style={{fontSize:16}}>{this.state.version}</span>
                            </div>
                        </TabPane>
                        <TabPane tab="系统工具" key="tools" style={{height:70}}>
                            <Spin tip={this.state.tip} spinning={this.state.load}>
                                <Button style={{margin:'10px 20px 10px 0',backgroundColor:'#F7F7F7'}} onClick={this.sysReboot}>重启</Button>
                                <Button onClick={this.sysShutdown} style={{backgroundColor:'#F7F7F7'}}>关机</Button>
                            </Spin>
                        </TabPane>
                        <TabPane tab="系统使用率" key="usage">
                            <Card
                                title="实时数据"
                            >
                                <Table
                                    dataSource={this.state.items2}
                                    columns={columns2}
                                    position={'both'}
                                    bordered
                                    size={'small'}
                                    pagination={{
                                        hideOnSinglePage:true
                                    }}
                                />
                            </Card>
                            <Card
                                title="CPU使用率"
                            >
                                <div style={{border:'1px solid rgb(221, 221, 221)',height:220}}>
                                    <Line {...config} />
                                </div>
                            </Card>

                            <Card
                                title="内存使用率"
                            >
                                <div style={{border:'1px solid rgb(221, 221, 221)',height:220}}>
                                    <Line {...config2} />
                                </div>
                            </Card>

                            <Card
                                title="磁盘读写速率"
                            >
                                <div style={{border:'1px solid rgb(221, 221, 221)',height:220}}>
                                    <Line {...config3} />
                                </div>
                            </Card>

                            <Card
                                title="数据盘占用率"
                            >
                                <div style={{border:'1px solid rgb(221, 221, 221)',height:220}}>
                                    <Line {...config4} />
                                </div>
                            </Card>


                        </TabPane>
                        <TabPane tab="系统备份" key="backup">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.backupFormRef} name="backupForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                            <Form.Item
                                                {...formItemLayout2}
                                                name="name"
                                                label="名称"
                                            >
                                                <Input type='text' placeholder="请输入文件名" />
                                            </Form.Item>

                                            <div style={{display:this.state.display}}>
                                                <Form.Item
                                                    {...formItemLayout2}
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

                                            <Form.Item {...formTailLayout2} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    搜索
                                                </Button>
                                                { Message }
                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {
                                                            this.backupFormRef.current.resetFields();
                                                            this.setState({
                                                                startTime: '',
                                                                endTime: '',
                                                            });
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
                                            <Button type="dashed" style={{backgroundColor:'#F7F7F7'}}
                                                    onClick={() => {
                                                        this.setState({
                                                            importModalVisible: true
                                                        })
                                                    }}>导入
                                            </Button>
                                            <Button type="primary" onClick={this.backupExport}>
                                                备份当前配置
                                            </Button>
                                            <Button type="dashed" style={{backgroundColor:'#F7F7F7'}} onClick={()=>{
                                                confirm({
                                                    icon: <ExclamationCircleOutlined/>,
                                                    content: '此操作会将系统恢复至初始状态，丢失所有数据',
                                                    onOk: () => { this.backupReset() },
                                                    onCancel() {
                                                    },
                                                });
                                            }}>
                                                恢复出厂设置
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>
                            <Spin tip='备份当前配置中...' spinning={this.state.currentLoad}>
                                <Spin tip='恢复中...' spinning={this.state.restoreLoad}>
                                    <Table key='backup-table'
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
                                               showTotal: total => `总计 ${total} 条`
                                           }}
                                           loading={this.state.tabLoading}
                                           onChange={this.handleTableChange}
                                           bordered
                                           size={'small'}
                                    />

                                    <div style={{margin:'-45px 0px 0 17px'}}>
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
                                </Spin>
                            </Spin>

                            {
                                this.state.renameVisible ?
                                    <Modal
                                        title="重命名"
                                        visible={this.state.renameVisible}
                                        okButtonProps={{form: 'rename-form', key: 'submit', htmlType: 'submit'}}
                                        onOk={() => {
                                            this.renameFormRef.current
                                                .validateFields()
                                                .then(async values => {
                                                    this.renameFormRef.current.resetFields();
                                                    await this.handleRename(values);
                                                })
                                        }}
                                        onCancel={() => {
                                            this.setState({
                                                renameVisible: false
                                            })
                                        }}
                                        centered={true}
                                    >
                                        <Form id={'rename-form'}
                                              ref={this.renameFormRef}
                                              initialValues={{newName:this.state.currentName}}>
                                            <Form.Item name='newName' rules={[{required: true, message: '请输入新的名称'}]}>
                                                <Input autoComplete="off" placeholder="新的名称"/>
                                            </Form.Item>
                                        </Form>
                                    </Modal> : undefined
                            }

                            {
                                this.state.importModalVisible ?
                                    <Modal title="导入备份文件" visible={true}
                                           onOk={() => {
                                               const formData = new FormData();
                                               formData.append("backupFile", this.state.fileList[0]);

                                               let headers = getHeaders();
                                               headers['Content-Type'] = 'multipart/form-data';

                                               axios
                                                   .post(server + "backup/importFile", formData, {
                                                       headers: headers
                                                   })
                                                   .then((resp) => {
                                                       this.setState({
                                                           importModalVisible: false
                                                       })
                                                       let result = resp.data;
                                                       if (result['code'] === 1) {
                                                           notification['success']({
                                                               message: '导入成功'
                                                           })
                                                       } else {
                                                           notification['error']({
                                                               message: '导入失败',
                                                               description: result['message'],
                                                           });
                                                       }
                                                       this.loadTableData();
                                                   });
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   importModalVisible: false
                                               })
                                           }}
                                           okButtonProps={{
                                               disabled: this.state.fileList.length === 0
                                           }}
                                    >
                                        <Upload
                                            maxCount={1}
                                            onRemove={file => {
                                                this.setState(state => {
                                                    const index = state.fileList.indexOf(file);
                                                    const newFileList = state.fileList.slice();
                                                    newFileList.splice(index, 1);
                                                    return {
                                                        fileList: newFileList,
                                                    };
                                                });
                                            }}
                                            beforeUpload={(file) => {
                                                this.setState(state => ({
                                                    fileList: [file],
                                                }));
                                                return false;
                                            }}
                                            fileList={this.state.fileList}
                                        >
                                            <Button icon={<UploadOutlined/>}>选择文件</Button>
                                        </Upload>
                                    </Modal> : undefined
                            }
                        </TabPane>
                        <TabPane tab="系统日志" key="syslog">
                            <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                                <Col span={19} key={1}>
                                    <Input.TextArea
                                        style={{width:'100%',marginTop:10,backgroundColor:'black',color:'white'}}
                                        autoSize={{
                                            maxRows: 25
                                        }}
                                        spellCheck="false"
                                        value={this.state.sysLog}
                                    />
                                </Col>
                                <Col span={5} key={2} style={{textAlign: 'right'}}>
                                    <Space>
                                        <Button style={{backgroundColor:'#F7F7F7'}} onClick={ this.getSysLog }>刷新</Button>

                                        <Button type="primary" onClick={this.ExportSysLog} style={{fontSize:14}}>
                                            导出
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tab="主机接入日志" key="accesslog">
                            <Spin tip={this.state.tip2} spinning={this.state.loading2}>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                                    <Col span={18} key={1}>
                                        <Input.TextArea
                                            style={{width:'100%',marginTop:10,backgroundColor:'black',color:'white'}}
                                            autoSize={{
                                                maxRows: 25
                                            }}
                                            value={this.state.accessLog}
                                            spellCheck="false"
                                        />
                                    </Col>
                                    <Col span={6} key={2}>
                                        <Row style={{justifyContent: "flex-end"}}>
                                            <Form ref={this.accessFormRef} name="accessForm" onFinish={this.changeMode}>
                                                <Form.Item
                                                    name="enable-debug"
                                                    label="调试模式"
                                                    tooltip={
                                                        <span>
                                                        调试模式建议在连接资产失败后当前连接日志无法确定出错原因时开启。<br/>
                                                        开启后有一定几率影响资产连接的速度和稳定性，请在确定资产连接出错原因后及时关闭。
                                                    </span>
                                                    }
                                                >
                                                    <Radio.Group onChange={()=>{this.accessFormRef.current.submit()}}>
                                                        <Radio value="true">启用</Radio>
                                                        <Radio value="false">禁用</Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </Form>
                                        </Row>
                                        <Row style={{justifyContent: "flex-end"}}>
                                            <Space>
                                                <Button style={{backgroundColor:'#F7F7F7'}} onClick={ this.getAccessLog }>刷新</Button>

                                                <Button type="primary" onClick={this.ExportGuacdLog} style={{fontSize:14}}>
                                                    导出
                                                </Button>
                                            </Space>
                                        </Row>
                                    </Col>
                                </Row>
                            </Spin>
                        </TabPane>
                    </Tabs>
                </Content>
            </>
        );
    }
}

export default HostMaintain;
