import React, {Component} from 'react';

import {
    Badge,
    Button, Checkbox,
    Col,
    Divider,
    Drawer, Dropdown,
    Form,
    Input,
    Layout, Menu,
    Modal, notification,
    Row, Select,
    Space,
    Table,
    Tag,
    Typography, Upload,
} from "antd";
import qs from "qs";
import UserModal from "./UserModal";
import request from "../../common/request";
import {message} from "antd/es";
import {
    DownOutlined,
    ExclamationCircleOutlined,
    InsuranceOutlined,
    LockOutlined, UploadOutlined, UpOutlined
} from '@ant-design/icons';
import UserShareSelectedAsset from "./UserShareSelectedAsset";
import {download, getHeaders, getToken} from "../../utils/utils";
import {server} from "../../common/env";
import axios from "axios";

const confirm = Modal.confirm;
const {Text} = Typography;
const {Content} = Layout;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class User extends Component {

    userFormRef = React.createRef();
    changePasswordFormRef = React.createRef()
    changeAssetGroupFormRef = React.createRef()
    changeAppFormRef = React.createRef()

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
        model: null,
        selectedRowKeys: [],
        delBtnLoading: false,
        assetVisible: false,
        changePasswordVisible: false,
        changePasswordConfirmLoading: false,
        selectedRow: {},
        userGroups: [],
        ulList:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
        divList:[],
        display:'none',
        judge:'down',
        importModalVisible: false,
        fileList: [],

        changeAssetGroupVisible:false,
        changeAssetGroupConfirmLoading:false,
        allAssetGroupData:[],
        selectedAssetGroup:[],
        changeAppVisible:false,
        changeAppConfirmLoading:false,
        allAppData:[],
        selectedApp:[],
    };

    componentDidMount() {
        this.loadTableData();
        this.getUserGroups();
        this.handelSetDivList();
    }

    async getUserGroups() {
        let result = await request.get('/users/user-groups-info');
        if (result['code'] === 1) {
            this.setState({
                userGroups: result['data']['items']
            })
        } else {
            message.error(result['message']);
        }
    }
    async delete(id) {
        let result = await request.delete('/users/' + id);
        if (result.code === 1) {
            message.success('????????????', 3);
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

        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/users/paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message, 10);
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

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams).then(r => {
        })
    };

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

    showModal(title, user = {}) {
        if(JSON.stringify(user)==='{}'){
            this.handelSetDivList();
        }else {
            this.setState({divList:user.expdata})
            if(user.username==='admin'){
                this.setState({limitBoxDisabled:true})
            }else {
                this.setState({limitBoxDisabled:false})
            }
        }
        this.setState({
            model: user,
            modalVisible: true,
            modalTitle: title
        });
    };

    handleCancelModal = e => {
        this.setState({
            modalVisible: false,
            modalTitle: ''
        });
    };

    handleOk = async (formData) => {
        // ?????? form ???????????????
        this.setState({
            modalConfirmLoading: true
        });
        formData.expdata=this.state.divList;
        if (formData.id) {
            // ?????????????????????
            const result = await request.put('/users/' + formData.id, formData);
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
            const result = await request.post('/users', formData);
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

    //??????
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'username': values.username,
            'nickname': values.nickname,
            "mail":values.mail,
        }
        this.setState({
            username: values.username,
            nickname: values.nickname,
            mail: values.mail,
        })
        this.loadTableData(query)
    }

    //??????
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'username': this.state.username,
            'nickname': this.state.nickname,
            'mail': this.state.mail,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //??????????????????
        download(`${server}users/export?${queryStr}`);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/users/' + this.state.selectedRowKeys.join(','));
            if (result['code'] === 1) {
                message.success('????????????', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result['message'], 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    handleChangePassword = async (values) => {
        this.setState({
            changePasswordConfirmLoading: true
        })
        let formData = new FormData();
        formData.append('password', values['password']);
        let result = await request.post(`/users/${this.state.selectedRow['id']}/change-password`, formData);
        if (result['code'] === 1) {
            message.success('????????????', 3);
        } else {
            message.error(result['message'], 10);
        }

        this.setState({
            changePasswordConfirmLoading: false,
            changePasswordVisible: false
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

    handelSetDivList=()=>{
        let list=[];
        for (let i = 1; i <= 7; i++) {
            for (let j = 0; j <= 23; j++) {
                let index = "" + i + "-" + j
                list.push({ name: index, checked: false })
            }
        }
        this.setState({
            divList:list
        })
    };

    handelAllow = ()=>{
        let list=this.state.divList;
        list.forEach((item,index)=>{
            item.checked = true;
        })
        this.setState({
            divList: list,
        });
    };

    handelForbid = ()=>{
        let list=this.state.divList;
        list.forEach((item,index)=>{
            item.checked = false;
        })
        this.setState({
            divList: list,
        });
    };

    handelWorkday = ()=>{
        let list=this.state.divList;
        list.forEach((item,index)=>{
            if(index<=119){
                item.checked= true
            }else if(index>=120){
                item.checked= false
            }
        })
        this.setState({
            divList: list,
        });
    };

    handClickCell = (item,index) =>{
        let list = this.state.divList;
        list[index].checked = !list[index].checked;
        this.setState({
            divList:list
        })
    };

    handleGetAssetGroup = async () => {
        const result = await request.get('/assetgroup/grantable');
        if (result.code === 1) {
            this.setState({
                allAssetGroupData:result.data.items
            })
        } else {
            message.error(result.message);
        }
    }

    handleSearchByAssetGroup = async (id) => {
        await this.handleGetAssetGroup()
        const result = await request.get(`/assetgroup/${id}/granted-users`);
        const items=[]
        if (result.code === 1) {
            result.data.items = result.data.items ?result.data.items :[]
            result.data.items.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedAssetGroup:items
            })
        } else {
            message.error(result.message);
        }
    }

    handleGetApp = async () => {
        const result = await request.get('/applic/granted');
        if (result.code === 1) {
            this.setState({
                allAppData:result.data.items
            })
        } else {
            message.error(result.message);
        }
    }

    handleSearchByApp = async (id) => {
        await this.handleGetApp()
        const result = await request.get(`/applic/user/${id}`);
        const items=[]
        if (result.code === 1) {
            result.data.items = result.data.items ?result.data.items :[]
            result.data.items.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedApp:items
            })
        } else {
            message.error(result.message);
        }
    }

    render() {

        const columns = [{
            title: '????????????',
            dataIndex: 'username',
            key: 'username',
            sorter: true,
            render: (username, record, index) => {
                return (
                    <Button type="link" size='small'
                            onClick={async () => {
                                let result = await request.get(`/users/${record['id']}`);
                                if (result['code'] !== 1) {
                                    message.error(result['message']);
                                    return;
                                }
                                this.showModal('????????????', result['data']);
                            }}>{username}</Button>
                );
            }
        }, {
            title: '????????????',
            dataIndex: 'nickname',
            key: 'nickname',
            sorter: true,
        }, {
            title: '?????????',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => {
                    return text
            }
        }, {
            title: '??????',
            dataIndex: 'mail',
            key: 'mail',
        }, {
            title: '????????????',
            dataIndex: 'totpSecret',
            key: 'totpSecret',
            render: (text, record) => {

                if (text === '1') {
                    return <Tag icon={<InsuranceOutlined/>} color="success">??????</Tag>;
                } else {
                    return <Tag icon={<ExclamationCircleOutlined/>} color="warning">??????</Tag>;
                }
            }
        }, {
            title: '????????????',
            dataIndex: 'online',
            key: 'online',
            render: text => {
                if (text) {
                    return (<Badge status="success" text="??????"/>);
                } else {
                    return (<Badge status="default" text="??????"/>);
                }
            }
        }, {
            title: '????????????',
            dataIndex: 'sharerAssetCount',
            key: 'sharerAssetCount',
            render: (text, record, index) => {
                return <Button type='link' onClick={async () => {
                    this.setState({
                        assetVisible: true,
                        sharer: record['id']
                    })
                }}>{text}</Button>
            }
        }, {
            title: '????????????',
            dataIndex: 'created',
            key: 'created',
            width:172,
            render: (text, record) => {
                return text
            },
            sorter: true,
        },
            {
                title: '??????',
                key: 'action',
                width: 143,
                render: (text, record) => {
                    const menu = (
                        <Menu>
                            <Menu.Item key="1">
                                <Button type="text" size='small'
                                        onClick={() => {
                                            this.setState({
                                                assetVisible: true,
                                                sharer: record['id']
                                            })
                                        }}>????????????</Button>
                            </Menu.Item>

                            <Menu.Item key="2">
                                <Button type="text" size='small'
                                        onClick={() => {
                                            this.handleSearchByAssetGroup(record.id)
                                                .then(() => {
                                                    this.setState({
                                                        changeAssetGroupVisible: true,
                                                        currentRow: record
                                                    })
                                                    this.changeAssetGroupFormRef
                                                        .current
                                                        .setFieldsValue({
                                                            assetGroupIds:this.state.selectedAssetGroup
                                                        })
                                                });
                                        }}>???????????????</Button>
                            </Menu.Item>

                            <Menu.Item key="3">
                                <Button type="text" size='small'
                                        onClick={() => {
                                            this.handleSearchByApp(record['id'])
                                                .then(() => {
                                                    this.setState({
                                                        changeAppVisible: true,
                                                        currentRow: record
                                                    })
                                                    this.changeAppFormRef
                                                        .current
                                                        .setFieldsValue({
                                                            appIds:this.state.selectedApp
                                                        })
                                                });
                                        }}>????????????</Button>

                            </Menu.Item>
                        </Menu>
                    );

                    return (
                        <div>
                            <Button type="link" size='small'
                                    onClick={async () => {
                                        let result = await request.get(`/users/${record['id']}`);
                                        if (result['code'] !== 1) {
                                            message.error(result['message']);
                                            return;
                                        }
                                        this.showModal('????????????', result['data']);
                                    }}>??????</Button>

                            <Button type="link" size='small'
                                    onClick={() => {
                                        this.setState({
                                            changePasswordVisible: true,
                                            selectedRow: record
                                        })
                                    }}>????????????</Button>

                            <Button type="link" size='small'
                                    onClick={() => {
                                        confirm({
                                            title: '?????????????????????????????????????????????????',
                                            content: record['name'],
                                            okText: '??????',
                                            cancelText: '??????',
                                            onOk: async () => {
                                                let result = await request.post(`/users/${record['id']}/reset-totp`);
                                                if (result['code'] === 1) {
                                                    message.success('????????????', 3);
                                                    this.loadTableData();
                                                } else {
                                                    message.error(result['message'], 10);
                                                }
                                            }
                                        });
                                    }}>?????????????????????</Button>

                            <Dropdown overlay={menu}>
                                <Button type="link" size='small'>
                                    ?????? <DownOutlined/>
                                </Button>
                            </Dropdown>

                            <Button type="text" size='small' danger
                                    disabled={record.username==='admin'}
                                    onClick={() => this.showDeleteConfirm(record.id, record.username)}>??????</Button>
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
                <Content className="site-layout-background page-content">
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>????????????</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.userFormRef} name="userForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="username"
                                        label="????????????"
                                    >
                                        <Input type='text' placeholder="?????????????????????" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="nickname"
                                            label="????????????"
                                        >
                                            <Input type='text' placeholder="?????????????????????" />
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="mail"
                                            label="??????"
                                        >
                                            <Input type='text' placeholder="?????????????????????" />
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
                                                    this.userFormRef.current.resetFields();
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

                    <Table rowSelection={rowSelection}
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
                               showTotal: total => `?????? ${total} ???`
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

                    {/* ????????????ant modal ????????????????????????????????????*/}
                    {
                        this.state.modalVisible ?
                            <UserModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                                userGroups={this.state.userGroups}
                                ulList = {this.state.ulList}
                                divList={this.state.divList}
                                handClickCell = {this.handClickCell}
                                handelAllow={this.handelAllow}
                                handelForbid={this.handelForbid}
                                handelWorkday={this.handelWorkday}
                                limitBoxDisabled={this.state.limitBoxDisabled}
                            >
                            </UserModal> : undefined
                    }

                    <Drawer
                        title="????????????"
                        placement="right"
                        closable={true}
                        destroyOnClose={true}
                        onClose={() => {
                            this.loadTableData(this.state.queryParams);
                            this.setState({
                                assetVisible: false
                            })
                        }}
                        visible={this.state.assetVisible}
                        width={window.innerWidth * 0.9}
                    >
                        <UserShareSelectedAsset
                            sharer={this.state.sharer}
                            userGroupId={undefined}
                        >
                        </UserShareSelectedAsset>
                    </Drawer>

                    {
                        this.state.changePasswordVisible ?
                            <Modal title="????????????" visible={this.state.changePasswordVisible}
                                   confirmLoading={this.state.changePasswordConfirmLoading}
                                   maskClosable={false}
                                   onOk={() => {
                                       this.changePasswordFormRef.current
                                           .validateFields()
                                           .then(values => {
                                               this.changePasswordFormRef.current.resetFields();
                                               this.handleChangePassword(values);
                                           })
                                           .catch(info => {

                                           });
                                   }}
                                   onCancel={() => {
                                       this.setState({
                                           changePasswordVisible: false
                                       })
                                   }}>

                                <Form ref={this.changePasswordFormRef}>

                                    <Form.Item name='password' rules={[{required: true, message: '??????????????????'}]}>
                                        <Input prefix={<LockOutlined/>} placeholder="??????????????????"/>
                                    </Form.Item>
                                </Form>
                            </Modal> : undefined
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
                                           .post(server + "users/import", formData, {
                                               headers: headers
                                           })
                                           .then((resp) => {
                                               this.setState({
                                                   importModalVisible: false
                                               })
                                               let result = resp.data;
                                               if (result['code'] === 1) {
                                                   notification['success']({
                                                       message: '????????????'
                                                   })
                                               } else {
                                                   notification['error']({
                                                       message: '????????????',
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
                                    <Button icon={<UploadOutlined/>}>????????????</Button>
                                </Upload>
                            </Modal> : undefined
                    }

                    <Modal title="???????????????" visible={this.state.changeAssetGroupVisible}
                           confirmLoading={this.state.changeAssetGroupConfirmLoading}
                           maskClosable={false}
                           onOk={() => {
                               this.setState({
                                   changeAssetGroupConfirmLoading: true
                               });

                               this.changeAssetGroupFormRef.current
                                   .validateFields()
                                   .then(async values => {
                                       if (values['assetGroupIds']) {
                                           values['assetGroupIds'] = values['assetGroupIds'].join(',');
                                       }
                                       const result = await request.put(`/assetgroup/${this.state.currentRow['id']}/grant?assetids=${values['assetGroupIds']}`);
                                       if (result.code === 1) {
                                           message.success(result.message);
                                           await this.loadTableData();
                                       } else {
                                           message.error( result.message, 10);
                                           this.setState({
                                               changeAssetGroupVisible: false
                                           });
                                       }

                                   })
                                   .catch(info => {

                                   })
                                   .finally(() => {
                                       this.setState({
                                           changeAssetGroupVisible: false,
                                           changeAssetGroupConfirmLoading: false
                                       })
                                   });
                           }}
                           onCancel={() => {
                               this.setState({
                                   changeAssetGroupVisible: false
                               })
                           }}>

                        <Form ref={this.changeAssetGroupFormRef}>

                            <Form.Item label="???????????????" name='assetGroupIds'>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="????????????????????????"
                                >
                                    {this.state.allAssetGroupData.map(d => <Select.Option key={d.id}
                                                                                      value={d.id}>{d.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>


                    <Modal title="????????????" visible={this.state.changeAppVisible}
                           confirmLoading={this.state.changeAppConfirmLoading}
                           maskClosable={false}
                           onOk={() => {
                               this.setState({
                                   changeAppConfirmLoading: true
                               });

                               this.changeAppFormRef.current
                                   .validateFields()
                                   .then(async values => {
                                       if (values['appIds']) {
                                           values['appIds'] = values['appIds'].join(',');
                                       }
                                       const result = await request.put(`/applic/${this.state.currentRow['id']}/grant?aid=${values['appIds']}`);
                                       if (result.code === 1) {
                                           message.success(result.message);
                                           await this.loadTableData();
                                       } else {
                                           message.error( result.message, 10);
                                           this.setState({
                                               changeAppVisible: false
                                           });
                                       }

                                   })
                                   .catch(info => {

                                   })
                                   .finally(() => {
                                       this.setState({
                                           changeAppVisible: false,
                                           changeAppConfirmLoading: false
                                       })
                                   });
                           }}
                           onCancel={() => {
                               this.setState({
                                   changeAppVisible: false
                               })
                           }}>

                        <Form ref={this.changeAppFormRef}>

                            <Form.Item label="????????????" name='appIds'>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="?????????????????????"
                                >
                                    {this.state.allAppData.map(d => <Select.Option key={d.id}
                                                                                      value={d.id}>{d.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>


                </Content>
            </>
        );
    }
}

export default User;
