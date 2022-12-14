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
            message.success('????????????');
            await this.loadTableData(this.state.queryParams);
        } else {
            message.error('????????????: ' + result.message, 10);
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

    //??????
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

    //??????
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
        //??????????????????
        download(`${server}assets/export?${queryStr}`);
    }

    showDeleteConfirm(id, content) {
        let self = this;
        confirm({
            title: '???????????????????????????????',
            content: content,
            okText: '??????',
            okType: 'danger',
            cancelText: '??????',
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
        await this.showModal('????????????', result.data);
    }

    async copy(id) {
        let result = await request.get(`/assets/${id}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }
        result.data['id'] = undefined;
        await this.showModal('????????????', result.data);
    }

    async showModal(title, asset = {}) {
        // ????????????
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
        // ?????? form ???????????????
        this.setState({
            modalConfirmLoading: true
        });

        if (formData['tags']) {
            formData.tags = formData['tags'].join(',');
        }

        if (formData.id) {
            // ?????????????????????
            const result = await request.put('/assets/' + formData.id, formData);
            if (result.code === 1) {
                message.success('????????????', 3);

                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('????????????: ' + result.message, 10);
            }
        } else {
            // ?????????????????????
            const result = await request.post('/assets', formData);
            if (result.code === 1) {
                message.success('????????????', 3);

                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('????????????: ' + result.message, 10);
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

        message.loading({content: '??????????????????????????????...', key: id});
        let result = await request.post(`/assets/${id}/tcping`);
        if (result.code === 1) {
            if (result.data === true) {
                message.success({content: '???????????????????????????????????????????????????????????????????????????', key: id, duration: 3});
                if (protocol === 'ssh' && (sshMode === 'native' || sshMode === 'naive')){
                    window.open(`#/term?assetId=${id}&assetName=${name}`);
                } else {
                    window.open(`#/access?assetId=${id}&assetName=${name}&protocol=${protocol}`);
                }
            } else {
                message.warn({content: '??????????????????????????????????????????????????????', key: id, duration: 10});
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
                message.success('????????????', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('????????????: ' + result.message, 10);
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
            title: '????????????',
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
            title: '????????????',
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
            title: '??????',
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
            title: '??????',
            dataIndex: 'active',
            key: 'active',
            render: text => {

                if (text) {
                    return (
                        <Tooltip title='?????????'>
                            <Badge status="processing"/>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title='?????????'>
                            <Badge status="error"/>
                        </Tooltip>
                    )
                }
            }
        }, {
            title: '?????????',
            dataIndex: 'ownerName',
            key: 'ownerName'
        }, {
            title: '????????????',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },
            {
                title: '??????',
                key: 'action',
                render: (text, record) => {
                    return (
                        <div>
                            <Button type="link" size='small'
                                    onClick={() => this.access(record)}>??????</Button>

                            <Button type="link" size='small'
                                    disabled={!hasPermission(record['owner'])}
                                    onClick={() => this.update(record.id)}>??????</Button>

                            <Button type="link" size='small'
                                    disabled={!hasPermission(record['owner'])}
                                    onClick={() => this.copy(record.id)}>??????</Button>

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

                                            }}>???????????????</Button> : undefined
                            }

                            <Button type="text" size='small' danger
                                    disabled={!hasPermission(record['owner'])}
                                    onClick={() => this.showDeleteConfirm(record.id, record.name)}>??????</Button>

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
                        }}>????????????????????????
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
                    ????????????????????????
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
                        <Text italic style={{fontSize:20,color:'#666'}}>????????????</Text>
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
                                        label="????????????"
                                    >
                                        <Input type='text' placeholder="?????????????????????" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="ip"
                                            label="??????IP"
                                        >
                                            <Input type='text' placeholder="???????????????IP" />
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="tags"
                                            label="??????"
                                        >
                                            <Select allowClear
                                                    mode="multiple"
                                                    placeholder="???????????????">
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
                                            label="????????????"
                                        >
                                            <Select allowClear placeholder="?????????????????????">
                                                <Select.Option value="">????????????</Select.Option>
                                                <Select.Option value="rdp">rdp</Select.Option>
                                                <Select.Option value="ssh">ssh</Select.Option>
                                                <Select.Option value="vnc">vnc</Select.Option>
                                                <Select.Option value="telnet">telnet</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            ??????
                                        </Button>
                                        { Message }
                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {this.handleExport()}}>
                                            ??????
                                        </Button>

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => {
                                            this.assetFormRef.current.resetFields();
                                            this.loadTableData({
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
                                    <Button type="dashed" style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => {
                                                this.setState({
                                                    importModalVisible: true
                                                })
                                            }}>??????
                                    </Button>

                                    <Button type="primary"
                                            onClick={() => this.showModal('????????????', {})}>??????
                                    </Button>

                                    <Button style={{backgroundColor:'#F7F7F7'}}
                                        onClick={() => { this.loadTableData(this.state.queryParams)}}>??????
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
                               showTotal: total => `?????? ${total} ???`,
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
                                        ???????????????????????????<Text style={{color: '#1890FF'}}
                                                       strong>{this.state.selectedRowKeys.length}</Text>???????????????
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
                                }}>????????????
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
                            <Modal title="????????????" visible={true}
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
                                               console.log("????????????", resp);
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
                                                           message: '??????????????????',
                                                           description: '???????????????' + successCount + '????????????',
                                                       });
                                                   } else {
                                                       notification['info']({
                                                           message: '??????????????????',
                                                           description: `???????????????${successCount}??????????????????${errorCount}????????????`,
                                                       });
                                                   }
                                               } else {
                                                   notification['error']({
                                                       message: '??????????????????',
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
                                        <Button icon={<UploadOutlined/>}>??????csv??????</Button>
                                    </Upload>

                                    <Button type="primary" onClick={() => {

                                        let csvString = 'name,ssh,127.0.0.1,22,accountType,username,password,privateKey,passphrase,description,tag1|tag2|tag3';
                                        //?????????"\uFEFF"????????????????????????????????????????????????????????????
                                        const blob = new Blob(["\uFEFF" + csvString], {type: 'text/csv;charset=gb2312;'});
                                        let a = document.createElement('a');
                                        a.download = 'sample.csv';
                                        a.href = URL.createObjectURL(blob);
                                        a.click();
                                    }}>
                                        ??????????????????
                                    </Button>
                                </Space>

                            </Modal>
                            : undefined
                    }

                    <Modal title={<Text>???????????????<strong style={{color: '#1890ff'}}>{this.state.selected['name']}</strong>???????????????
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
                                           message.success('????????????');
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

                            <Form.Item name='owner' rules={[{required: true, message: '??????????????????'}]}>
                                <Select
                                    showSearch
                                    placeholder='??????????????????'
                                    onSearch={this.handleSearchByName}
                                    filterOption={false}
                                >
                                    {this.state.users.map(d => <Select.Option key={d.id}
                                                                              value={d.id}>{d.username}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Alert message="?????????????????????????????????????????????????????????" type="info" showIcon/>

                        </Form>
                    </Modal>
                </Content>
            </>
        );
    }
}

export default Asset;
