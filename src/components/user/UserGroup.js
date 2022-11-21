import React, {Component} from 'react';

import {
    Button,
    Checkbox,
    Col,
    Divider,
    Drawer,
    Form,
    Input,
    Layout,
    Modal, notification,
    Row, Select,
    Space,
    Table,
    Typography, Upload,
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {ExclamationCircleOutlined, UploadOutlined} from '@ant-design/icons';
import UserGroupModal from "./UserGroupModal";
import UserShareSelectedAsset from "./UserShareSelectedAsset";
import {download, getHeaders, getToken} from "../../utils/utils";
import {server} from "../../common/env";
import axios from "axios";

const confirm = Modal.confirm;
const {Text} = Typography;
const {Content} = Layout;
const test = []
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class UserGroup extends Component {

    userGroupFormRef = React.createRef();
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
        model: undefined,
        selectedRowKeys: [],
        delBtnLoading: false,
        users: [],
        change: false,
        treeData: [],
        checkedKeys:[],
        childNodes: [],
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
        this.getRoleMenu();
    }

    async getRoleMenu() {
        let result = await request.get('/user-groups/menu-tree-select');
        if (result['code'] === 1) {
            this.requestList(this.handleTreeData(result['data'])) //获取到的所有父子节点的数组进行处理
            this.setState({
                treeData: this.handleTreeData(result['data'])
            })
        } else {
            message.error(result['message']);
        }
    }

    handleTreeData = (data) =>{
        let arr = [];
        data.forEach((item)=>{
            arr.push({
                title: item.title,
                key: item.id,
                children: item.child ?this.handleTreeData(item.child) :[],
            });
        });
        return arr
    }

    //这个方法是筛选出来所有的子节点，存放在test数组中
    requestList = (data)=> {
       //test存放所有子节点的数组
        data && data.map(item=>{
            if(item.children && item.children.length>0){
                this.requestList(item.children)
            }else{
                test.push(item.key)
            }
            return null
        })
        return test
    }
    uniqueTree =(arr1,arr2)=> {
        let uniqueChild = [];
        for(let i = 0; i < arr2.length; i++){
            for(let j = 0; j < arr1.length; j++){
                if(arr1[j] === arr2[i]){
                    uniqueChild.push(arr1[j])
                }
            }
        }
        return uniqueChild
    }

    onCheck = (checkedKeys ,info) =>{
        //halfCheckedKeys 是子节点没有全部勾选状态下的父节点
        let checkkeys =  [...checkedKeys, ...info.halfCheckedKeys]
        //checkkeys为所有的选中的节点，包括子节点没有全部勾选状态下的父节点，传递给后端
        this.setState({checkedKeys:checkkeys})
        //checkedKeys为点击复选框时选中的节点，传递给前端
        this.setState({ childNodes: checkedKeys})
        console.log("checkkeys",checkkeys)
    }

    async delete(id) {
        let result = await request.delete('/user-groups/' + id);
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
            let result = await request.get('/user-groups/paging?' + paramsStr);
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
            width:500,
            title: <p>您确定要删除此用户组吗?<br/>(删除后该用户组下的成员会自动归属至普通用户组)</p>,
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(id);
            }
        });
    };

    showModal = async (title, id, index) => {

        let items = this.state.items;

        let model = {}
        if (id) {
            items[index].updateBtnLoading = true;
            this.setState({
                items: items
            });

            let result = await request.get('/user-groups/' + id);
            if (result['code'] !== 1) {
                message.error(result['message']);
                items[index].updateBtnLoading = false;
                this.setState({
                    items: items
                });
                return;
            }

            items[index].updateBtnLoading = false;
            model = result['data']
        }
        await this.handleSearchByNickname('');
        if(model.name==="管理组"||model.name==="运维组"||model.name==="审计组"||model.name==="普通用户组"){
            this.setState({change:true})
        }else{
            this.setState({change:false})
        }
        //返回前端展示的菜单权限对应id
        if(model.menuIds){
            let uniqueChild = this.uniqueTree(model.menuIds,test)  //数组进行比对删选出来父节点
            this.setState({ childNodes: uniqueChild})
        }else {
            this.setState({ childNodes: null})
        }
        this.setState({
            model: model,
            modalVisible: true,
            modalTitle: title,
        });
    };

    handleCancelModal = e => {
        this.setState({
            modalVisible: false,
            modalTitle: '',
            model: undefined
        });
    };

    handleOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });
        formData.menuIds = this.state.checkedKeys
        if (formData.id) {
            // 向后台提交数据
            const result = await request.put('/user-groups/' + formData.id, formData);
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
            const result = await request.post('/user-groups', formData);
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
            'name': values.name,
        }
        this.setState({name:values.name})
        this.loadTableData(query)
    }

    //导出
    handleExport= async () =>{
        let token = getToken();
        let query = {
            'name': this.state.name,
            'X-Auth-Token': token
        }
        let queryStr = qs.stringify(query);
        //文件下载操作
        download(`${server}user-groups/export?${queryStr}`);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/user-groups/' + this.state.selectedRowKeys.join(','));
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

    handleSearchByNickname = async nickname => {
        const result = await request.get(`/users/paging?pageIndex=1&pageSize=1000&nickname=${nickname}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }

        this.setState({
            users: result.data.items
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
        const result = await request.get(`/assetgroup/${id}/granted-groups`);
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
        const result = await request.get(`/applic/group/${id}`);
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
            title: '名称',
            dataIndex: 'name',
            sorter: true,
            render: (name, record, index) => {
                return (
                    <Button type="link" size='small'
                            loading={this.state.items[index].updateBtnLoading}
                            onClick={() => this.showModal('更新用户组', record['id'], index)}>{name}</Button>
                );
            }
        }, {
            title: '授权主机',
            dataIndex: 'assetCount',
            key: 'assetCount',
            render: (text, record, index) => {
                return <Button type='link' onClick={async () => {
                    this.setState({
                        assetVisible: true,
                        userGroupId: record['id']
                    })
                }}>{text}</Button>
            }
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
                render: (text, record, index) => {
                    let button
                    if(record.name==="管理组"||record.name==="普通用户组" || record.name==="审计组" || record.name==="运维组"){

                    }else {
                        button=(
                        <Button type="link" size='small' danger
                                onClick={() => this.showDeleteConfirm(record.id, record.name)}>删除</Button>)
                    }
                    return (
                        <div>
                            <Button type="link" size='small'
                                    loading={this.state.items[index].updateBtnLoading}
                                    onClick={() => this.showModal('更新用户组', record['id'], index)}>编辑</Button>
                            <Button type="link" size='small'
                                    onClick={() => {
                                        this.setState({
                                            assetVisible: true,
                                            userGroupId: record['id']
                                        })
                                    }}>主机授权</Button>

                            <Button type="link" size='small'
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

                            <Button type="link" size='small'
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

                            {button}
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
                        <Text italic style={{fontSize:20,color:'#666'}}>用户组列表</Text>
                        <Divider />
                        <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                            <Col span={14} key={1}>
                                <Form ref={this.userGroupFormRef} name="userGroupForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="name"
                                        label="名称"
                                    >
                                        <Input type='text' placeholder="请输入用户组名称" />
                                    </Form.Item>

                                    <Form.Item {...formTailLayout} className="search">
                                        <Button type="primary" htmlType="submit">
                                            搜索
                                        </Button>

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {this.handleExport()}}>
                                            导出
                                        </Button>

                                        <Button style={{backgroundColor:'#F7F7F7'}}
                                                onClick={() => {
                                                    this.userGroupFormRef.current.resetFields();
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
                                            onClick={() => this.showModal('新增用户组')}>新增
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
                    {this.state.modalVisible ?
                        <UserGroupModal
                            visible={this.state.modalVisible}
                            title={this.state.modalTitle}
                            handleOk={this.handleOk}
                            handleCancel={this.handleCancelModal}
                            confirmLoading={this.state.modalConfirmLoading}
                            model={this.state.model}
                            users={this.state.users}
                            change={this.state.change}
                            treeData={this.state.treeData}
                            onCheck={this.onCheck}
                            checkedNodes={this.state.childNodes}
                        >
                        </UserGroupModal> : undefined
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
                            userGroupId={this.state.userGroupId}
                        >
                        </UserShareSelectedAsset>
                    </Drawer>


                    {
                        this.state.importModalVisible ?
                            <Modal title="导入用户" visible={true}
                                   onOk={() => {
                                       const formData = new FormData();
                                       formData.append("file", this.state.fileList[0]);

                                       let headers = getHeaders();
                                       headers['Content-Type'] = 'multipart/form-data';

                                       axios
                                           .post(server + "user-groups/import", formData, {
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
                                       const result = await request.put(`/assetgroup/group/${this.state.currentRow['id']}/grant?assetids=${values['assetGroupIds']}`);
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
                                       const result = await request.put(`/applic/${this.state.currentRow['id']}/grant-group?aid=${values['appIds']}`);
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

export default UserGroup;
