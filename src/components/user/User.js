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
            message.success('操作成功', 3);
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
            title: '您确定要删除此用户吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
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
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });
        formData.expdata=this.state.divList;
        if (formData.id) {
            // 向后台提交数据
            const result = await request.put('/users/' + formData.id, formData);
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
            const result = await request.post('/users', formData);
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

    //搜索
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

    //导出
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'username': this.state.username,
            'nickname': this.state.nickname,
            'mail': this.state.mail,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}users/export?${queryStr}`);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/users/' + this.state.selectedRowKeys.join(','));
            if (result['code'] === 1) {
                message.success('操作成功', 3);
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
            message.success('操作成功', 3);
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
            title: '登录账号',
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
                                this.showModal('更新用户', result['data']);
                            }}>{username}</Button>
                );
            }
        }, {
            title: '用户昵称',
            dataIndex: 'nickname',
            key: 'nickname',
            sorter: true,
        }, {
            title: '用户组',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => {
                    return text
            }
        }, {
            title: '邮箱',
            dataIndex: 'mail',
            key: 'mail',
        }, {
            title: '二次认证',
            dataIndex: 'totpSecret',
            key: 'totpSecret',
            render: (text, record) => {

                if (text === '1') {
                    return <Tag icon={<InsuranceOutlined/>} color="success">开启</Tag>;
                } else {
                    return <Tag icon={<ExclamationCircleOutlined/>} color="warning">关闭</Tag>;
                }
            }
        }, {
            title: '在线状态',
            dataIndex: 'online',
            key: 'online',
            render: text => {
                if (text) {
                    return (<Badge status="success" text="在线"/>);
                } else {
                    return (<Badge status="default" text="离线"/>);
                }
            }
        }, {
            title: '授权资产',
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
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            width:172,
            render: (text, record) => {
                return text
            },
            sorter: true,
        },
            {
                title: '操作',
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
                                        }}>主机授权</Button>
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
                                        }}>主机组授权</Button>
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
                                        }}>应用授权</Button>

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
                                        this.showModal('更新用户', result['data']);
                                    }}>编辑</Button>

                            <Button type="link" size='small'
                                    onClick={() => {
                                        this.setState({
                                            changePasswordVisible: true,
                                            selectedRow: record
                                        })
                                    }}>修改密码</Button>

                            <Button type="link" size='small'
                                    onClick={() => {
                                        confirm({
                                            title: '您确定要重置此用户的双因素认证吗?',
                                            content: record['name'],
                                            okText: '确定',
                                            cancelText: '取消',
                                            onOk: async () => {
                                                let result = await request.post(`/users/${record['id']}/reset-totp`);
                                                if (result['code'] === 1) {
                                                    message.success('操作成功', 3);
                                                    this.loadTableData();
                                                } else {
                                                    message.error(result['message'], 10);
                                                }
                                            }
                                        });
                                    }}>重置双因素认证</Button>

                            <Dropdown overlay={menu}>
                                <Button type="link" size='small'>
                                    授权 <DownOutlined/>
                                </Button>
                            </Dropdown>

                            <Button type="text" size='small' danger
                                    disabled={record.username==='admin'}
                                    onClick={() => this.showDeleteConfirm(record.id, record.username)}>删除</Button>
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
                    <div>
                        <Text italic style={{fontSize:20,color:'#666'}}>用户列表</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.userFormRef} name="userForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="username"
                                        label="登录账号"
                                    >
                                        <Input type='text' placeholder="请输入登录账号" />
                                    </Form.Item>
                                    <div style={{display:this.state.display}}>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="nickname"
                                            label="用户昵称"
                                        >
                                            <Input type='text' placeholder="请输入用户昵称" />
                                        </Form.Item>
                                        <Form.Item
                                            {...formItemLayout}
                                            name="mail"
                                            label="邮箱"
                                        >
                                            <Input type='text' placeholder="请输入用户邮箱" />
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
                                                    this.userFormRef.current.resetFields();
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
                                            onClick={() => this.showModal('新增用户', {})}>新增
                                    </Button>

                                    <Button style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => { this.loadTableData(this.state.queryParams)}}>刷新
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
                               showTotal: total => `总计 ${total} 条`
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

                    {/* 为了屏蔽ant modal 关闭后数据仍然遗留的问题*/}
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
                        title="主机授权"
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
                            <Modal title="修改密码" visible={this.state.changePasswordVisible}
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

                                    <Form.Item name='password' rules={[{required: true, message: '请输入新密码'}]}>
                                        <Input prefix={<LockOutlined/>} placeholder="请输入新密码"/>
                                    </Form.Item>
                                </Form>
                            </Modal> : undefined
                    }


                    {
                        this.state.importModalVisible ?
                            <Modal title="导入用户" visible={true}
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

                    <Modal title="主机组授权" visible={this.state.changeAssetGroupVisible}
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

                            <Form.Item label="关联主机组" name='assetGroupIds'>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="请选择关联主机组"
                                >
                                    {this.state.allAssetGroupData.map(d => <Select.Option key={d.id}
                                                                                      value={d.id}>{d.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>


                    <Modal title="应用授权" visible={this.state.changeAppVisible}
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

                            <Form.Item label="关联应用" name='appIds'>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="请选择关联应用"
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
