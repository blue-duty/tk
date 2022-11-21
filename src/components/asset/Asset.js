import React, {Component} from 'react';

import {
    Alert,
    Badge,
    Button, Checkbox,
    Col,
    Divider,
    Form,
    Input,
    Layout,
    Modal,
    notification,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import AssetModal from "./AssetModal";
import request from "../../common/request";
import {message} from "antd/es";
import {download, getHeaders, getToken, isEmpty} from "../../utils/utils";
import {
    DownOutlined,
    ExclamationCircleOutlined,
    UploadOutlined, UpOutlined
} from '@ant-design/icons';
import {PROTOCOL_COLORS} from "../../common/constants";

import {hasPermission, isAdmin} from "../../service/permission";
import Upload from "antd/es/upload";
import axios from "axios";
import {server} from "../../common/env";


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

class Asset extends Component {

    assetFormRef = React.createRef();
    changeOwnerFormRef = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            protocol: '',
            tags: ''
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
    };

    async componentDidMount() {

        this.loadTableData();

        let result = await request.get('/tags');
        if (result['code'] === 1) {
            this.setState({
                tags: result['data']
            })
        }
    }

    async delete(id) {
        const result = await request.delete('/assets/' + id);
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
            let result = await request.get('/assets/paging?' + paramsStr);
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
            "tags":values.tags,
            'protocol': values.protocol,
        }
        this.setState({
            name: values.name,
            ip: values.ip,
            selectedTags: values.tags,
            protocol: values.protocol,
        })
        this.loadTableData(query)
    }

    //导出
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'name': this.state.name,
            'ip': this.state.ip,
            'tags': this.state.selectedTags,
            'protocol': this.state.protocol,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}assets/export?${queryStr}`);
    }

    showDeleteConfirm(id, content) {
        let self = this;
        confirm({
            title: '您确定要删除此主机吗?',
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
        let result = await request.get(`/assets/${id}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }
        await this.showModal('更新主机', result.data);
    }

    async copy(id) {
        let result = await request.get(`/assets/${id}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }
        result.data['id'] = undefined;
        await this.showModal('复制主机', result.data);
    }

    async showModal(title, asset = {}) {
        // 并行请求
        let getCredentials = request.get('/credentials');
        let getTags = request.get('/tags');

        let credentials = [];
        let tags = [];

        let r1 = await getCredentials;
        let r2 = await getTags;

        if (r1['code'] === 1) {
            credentials = r1['data'];
        }

        if (r2['code'] === 1) {
            tags = r2['data'];
        }

        if (asset['tags'] && typeof (asset['tags']) === 'string') {
            if (asset['tags'] === '' || asset['tags'] === '-') {
                asset['tags'] = [];
            } else {
                asset['tags'] = asset['tags'].split(',');
            }
        } else {
            asset['tags'] = [];
        }

        asset['use-ssl'] = asset['use-ssl'] === 'true';
        asset['ignore-cert'] = asset['ignore-cert'] === 'true';
        asset['enable-drive'] = asset['enable-drive'] === 'true';

        this.setState({
            modalTitle: title,
            modalVisible: true,
            credentials: credentials,
            tags: tags,
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

        if (formData['tags']) {
            formData.tags = formData['tags'].join(',');
        }

        if (formData.id) {
            // 向后台提交数据
            const result = await request.put('/assets/' + formData.id, formData);
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
            const result = await request.post('/assets', formData);
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
        const protocol = record['protocol'];
        const name = record['name'];
        const sshMode = record['sshMode'];

        message.loading({content: '正在检测主机是否在线...', key: id});
        let result = await request.post(`/assets/${id}/tcping`);
        if (result.code === 1) {
            if (result.data === true) {
                message.success({content: '检测完成，您访问的主机在线，即将打开窗口进行访问。', key: id, duration: 3});
                if (protocol === 'ssh' && (sshMode === 'native' || sshMode === 'naive')){
                    window.open(`#/term?assetId=${id}&assetName=${name}`);
                } else {
                    window.open(`#/access?assetId=${id}&assetName=${name}&protocol=${protocol}`);
                }
            } else {
                message.warn({content: '您访问的主机未在线，请确认网络状态。', key: id, duration: 10});
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
            let result = await request.delete('/assets/' + this.state.selectedRowKeys.join(','));
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

    handleSearchByName = async() => {
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
            title: '主机名称',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                let short = name;
                if (short && short.length > 20) {
                    short = short.substring(0, 20) + " ...";
                }

                if (hasPermission(record['owner'])) {
                    return (
                        <Button type="link" size='small' onClick={() => this.update(record.id)}>
                            <Tooltip placement="topLeft" title={name}>
                                {short}
                            </Tooltip>
                        </Button>
                    );
                } else {
                    return (
                        <Tooltip placement="topLeft" title={name}>
                            {short}
                        </Tooltip>
                    );
                }
            },
            sorter: true,
        },{
            title: '连接协议',
            dataIndex: 'protocol',
            key: 'protocol',
            render: (text, record) => {
                const title = `${record['ip'] + ':' + record['port']}`
                return (
                    <Tooltip title={title}>
                        <Tag color={PROTOCOL_COLORS[text]}>{text}</Tag>
                    </Tooltip>
                )
            }
        }, {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            render: tags => {
                if (!isEmpty(tags)) {
                    let tagDocuments = []
                    let tagArr = tags.split(',');
                    for (let i = 0; i < tagArr.length; i++) {
                        if (tags[i] === '-') {
                            continue;
                        }
                        tagDocuments.push(<Tag key={tagArr[i]}>{tagArr[i]}</Tag>)
                    }
                    return tagDocuments;
                }
            }
        }, {
            title: '状态',
            dataIndex: 'active',
            key: 'active',
            render: text => {

                if (text) {
                    return (
                        <Tooltip title='运行中'>
                            <Badge status="processing"/>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title='不可用'>
                            <Badge status="error"/>
                        </Tooltip>
                    )
                }
            }
        }, {
            title: '所有者',
            dataIndex: 'ownerName',
            key: 'ownerName'
        }, {
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => {
                    return (
                        <div>
                            <Button type="link" size='small'
                                    onClick={() => this.access(record)}>接入</Button>

                            <Button type="link" size='small'
                                    disabled={!hasPermission(record['owner'])}
                                    onClick={() => this.update(record.id)}>编辑</Button>

                            <Button type="link" size='small'
                                    disabled={!hasPermission(record['owner'])}
                                    onClick={() => this.copy(record.id)}>复制</Button>

                            {isAdmin() ?
                                    <Button type="link" size='small'
                                            disabled={!hasPermission(record['owner'])}
                                            onClick={() => {
                                                this.handleSearchByName('')
                                                    .then(() => {
                                                        this.setState({
                                                            changeOwnerModalVisible: true,
                                                            selected: record,
                                                        })
                                                        this.changeOwnerFormRef
                                                            .current
                                                            .setFieldsValue({
                                                                owner: record['owner']
                                                            })
                                                    });

                                            }}>更换所有者</Button> : undefined
                            }

                            <Button type="text" size='small' danger
                                    disabled={!hasPermission(record['owner'])}
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
                        <Text italic style={{fontSize:20,color:'#666'}}>主机列表</Text>
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
                                        label="主机名称"
                                    >
                                        <Input type='text' placeholder="请输入主机名称" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="ip"
                                            label="主机IP"
                                        >
                                            <Input type='text' placeholder="请输入主机IP" />
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="tags"
                                            label="标签"
                                        >
                                            <Select allowClear
                                                    mode="multiple"
                                                    placeholder="请选择标签">
                                                {this.state.tags.map(tag => {
                                                    if (tag === '-') {
                                                        return undefined;
                                                    }
                                                    return (<Select.Option key={tag}>{tag}</Select.Option>)
                                                })}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            name="protocol"
                                            label="连接协议"
                                        >
                                            <Select allowClear placeholder="请选择连接协议">
                                                <Select.Option value="">全部协议</Select.Option>
                                                <Select.Option value="rdp">rdp</Select.Option>
                                                <Select.Option value="ssh">ssh</Select.Option>
                                                <Select.Option value="vnc">vnc</Select.Option>
                                                <Select.Option value="telnet">telnet</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>
                                        { Message }
                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {this.handleExport()}}>
                                            导出
                                        </Button>

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
                                    <Button type="dashed" style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => {
                                                this.setState({
                                                    importModalVisible: true
                                                })
                                            }}>导入
                                    </Button>

                                    <Button type="primary"
                                            onClick={() => this.showModal('新增主机', {})}>新增
                                    </Button>

                                    <Button style={{backgroundColor:'#F7F7F7'}}
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
                            <AssetModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                credentials={this.state.credentials}
                                tags={this.state.tags}
                                model={this.state.model}
                            />
                            : null
                    }

                    {
                        this.state.importModalVisible ?
                            <Modal title="主机导入" visible={true}
                                   onOk={() => {
                                       const formData = new FormData();
                                       formData.append("file", this.state.fileList[0]);

                                       let headers = getHeaders();
                                       headers['Content-Type'] = 'multipart/form-data';

                                       axios
                                           .post(server + "assets/import", formData, {
                                               headers: headers
                                           })
                                           .then((resp) => {
                                               console.log("上传成功", resp);
                                               this.setState({
                                                   importModalVisible: false
                                               })
                                               let result = resp.data;
                                               if (result['code'] === 1) {
                                                   let data = result['data'];
                                                   let successCount = data['successCount'];
                                                   let errorCount = data['errorCount'];
                                                   if (errorCount === 0) {
                                                       notification['success']({
                                                           message: '导入主机成功',
                                                           description: '共导入成功' + successCount + '条主机。',
                                                       });
                                                   } else {
                                                       notification['info']({
                                                           message: '导入主机完成',
                                                           description: `共导入成功${successCount}条主机，失败${errorCount}条主机。`,
                                                       });
                                                   }
                                               } else {
                                                   notification['error']({
                                                       message: '导入主机失败',
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
                                <Space>
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
                                        <Button icon={<UploadOutlined/>}>选择csv文件</Button>
                                    </Upload>

                                    <Button type="primary" onClick={() => {

                                        let csvString = 'name,ssh,127.0.0.1,22,accountType,username,password,privateKey,passphrase,description,tag1|tag2|tag3';
                                        //前置的"\uFEFF"为“零宽不换行空格”，可处理中文乱码问题
                                        const blob = new Blob(["\uFEFF" + csvString], {type: 'text/csv;charset=gb2312;'});
                                        let a = document.createElement('a');
                                        a.download = 'sample.csv';
                                        a.href = URL.createObjectURL(blob);
                                        a.click();
                                    }}>
                                        下载样本文件
                                    </Button>
                                </Space>

                            </Modal>
                            : undefined
                    }

                    <Modal title={<Text>更换主机「<strong style={{color: '#1890ff'}}>{this.state.selected['name']}</strong>」的所有者
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
                                       let result = await request.post(`/assets/${this.state.selected['id']}/change-owner?owner=${values['owner']}`);
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
                                    onSearch={this.handleSearchByName}
                                    filterOption={false}
                                >
                                    {this.state.users.map(d => <Select.Option key={d.id}
                                                                              value={d.id}>{d.username}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Alert message="更换主机所有者不会影响授权凭证的所有者" type="info" showIcon/>

                        </Form>
                    </Modal>
                </Content>
            </>
        );
    }
}

export default Asset;
