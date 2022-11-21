import React, {Component} from 'react';

import {
    Button,
    Col,
    Input,
    Layout,
    Modal,
    Row,
    Space,
    Table,
    Tooltip,
    Typography,
    Tabs,
    Dropdown,
    Menu, Form, Select, Checkbox, Switch
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";
import {DownOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import PolicyListModal from "./PolicyListModal";
import OrderSetsModal from "./OrderSetsModal";
import OrderContentModal from "./OrderContentModal";

const confirm = Modal.confirm;
const {Content} = Layout;
const {Text} = Typography;
const { TabPane } = Tabs;
const {TextArea} = Input;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class CommandControl extends Component {

    taticFormRef = React.createRef();
    commandFormRef = React.createRef();
    commandsFormRef = React.createRef();
    changeOrderFormRef = React.createRef()
    changeOrderSetFormRef = React.createRef()
    changeUserFormRef = React.createRef()
    changeUserGroupFormRef = React.createRef()
    changeAssetFormRef = React.createRef()
    changeAssetGroupFormRef = React.createRef()

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
        selectedRowKeys: [],
        orderModalVisible:false,
        orderConfirmLoading:false,
        orderSetModalVisible:false,
        orderSetConfirmLoading:false,
        userModalVisible:false,
        userConfirmLoading:false,
        userGroupModalVisible:false,
        userGroupConfirmLoading:false,
        changeAssetVisible:false,
        changeAssetConfirmLoading:false,
        changeAssetGroupVisible:false,
        changeAssetGroupConfirmLoading:false,
        forbidLoading:false,
        dataForm:{},
        allSetsData:[],
        selectedSets:[],
        allUsersData:[],
        selectedUsers:[],
        allUserGroupsData:[],
        selectedUserGroups:[],
        allAssetsData:[],
        selectedAssets:[],
        allAssetGroupData:[],
        selectedAssetGroup:[],
        //第二张表
        items2: [],
        total2: 0,
        queryParams2: {
            pageIndex: 1,
            pageSize: 10
        },
        loading2: false,
        modalVisible2: false,
        modalTitle2: '',
        modalConfirmLoading2: false,
        selectedRowKeys2:[],
        currentRow:{},
        //第三张表
        tabModalVisible:false,
        items3: [],
        total3: 0,
        queryParams3: {
            pageIndex: 1,
            pageSize: 10,
        },
        loading3: false,
        modalVisible3: false,
        modalTitle3: '',
        modalConfirmLoading3: false,
        selectedRowKeys3:[]
    };

    componentDidMount() {
        this.loadTableData();
        this.loadTableData2();
    }

    handleOnTabChange = () => {
        this.loadTableData();
        this.loadTableData2();
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
            let result = await request.get('/commands/policy_paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
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

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }
        this.loadTableData(query);
    }

    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
        }
        this.loadTableData(query)
    }

    async delete(id) {
        const result = await request.delete('/commands/policy_delete/' + id);
        if (result.code === 1) {
            message.success('删除成功');
            this.loadTableData(this.state.queryParams);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }
    }

    showDeleteConfirm(id, content) {
        let self = this;
        confirm({
            title: '您确定要删除此项吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(id);
            }
        });
    };

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/commands/policy_delete/' + this.state.selectedRowKeys.join(','));
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

    showModal(title, obj = null) {
        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: obj
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

        if (formData.id) {
            // 编辑
            const result = await request.put('/commands/policy_update/' + formData.id, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false
                });
                this.loadTableData(this.state.queryParams);
            } else {
                message.error('更新失败: ' + result.message, 10);
            }
        } else {
            // 新增
            const result = await request.post('/commands/policy_create', formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible: false
                });
                this.loadTableData(this.state.queryParams);
            } else {
                message.error('新增失败: ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    handleByOrder = async (record) => {
        const result = await request.get(`/commands/policy_content_paging?policyId=${record.id}`);
        if (result.code === 1) {
            let formData = new FormData();
            formData.content = result.data.content
            this.setState({
                dataForm:formData
            })
        } else {
            message.error(result.message);
        }
    }

    handleGetOrderSets = async () => {
        const result = await request.get('/commands/policy_set_all');
        if (result.code === 1) {
            this.setState({
                allSetsData:result.data
            })
        } else {
            message.error(result.message);
        }
    }

    handleByOrderSet = async (record) => {
        await this.handleGetOrderSets()
        const result = await request.get(`/commands/policy_set_paging?policyId=${record.id}`);
        const items=[]
        if (result.code === 1) {
            result.data = result.data ?result.data :[]
            result.data.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedSets:items
            })
        } else {
            message.error(result.message);
        }
    }

    handleGetUsers = async () => {
        const result = await request.get('/commands/policy_user_all');
        if (result.code === 1) {
            this.setState({
                allUsersData:result.data
            })
        } else {
            message.error(result.message);
        }
    }

    handleByUser = async (record) => {
        await this.handleGetUsers()
        const result = await request.get(`/commands/policy_user_paging?policyId=${record.id}`);
        const items=[]
        if (result.code === 1) {
            result.data = result.data ?result.data :[]
            result.data.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedUsers:items
            })
        } else {
            message.error(result.message);
        }
    }

    handleGetUserGroups = async () => {
        const result = await request.get('/commands/policy_user_group_all');
        if (result.code === 1) {
            this.setState({
                allUserGroupsData:result.data
            })
        } else {
            message.error(result.message);
        }
    }

    handleByUserGroup = async (record) => {
        await this.handleGetUserGroups()
        const result = await request.get(`/commands/policy_user_group_paging?policyId=${record.id}`);
        const items=[]
        if (result.code === 1) {
            result.data = result.data ?result.data :[]
            result.data.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedUserGroups:items
            })
        } else {
            message.error(result.message);
        }
    }

    handleGetAssets = async () => {
        const result = await request.get('/commands/policy_asset_all');
        if (result.code === 1) {
            this.setState({
                allAssetsData:result.data
            })
        } else {
            message.error(result.message);
        }
    }

    handleByAsset = async (record) => {
        await this.handleGetAssets()
        const result = await request.get(`/commands/policy_asset_paging?policyId=${record.id}`);
        const items=[]
        if (result.code === 1) {
            result.data = result.data ?result.data :[]
            result.data.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedAssets:items
            })
        } else {
            message.error(result.message);
        }
    }

    handleGetAssetGroup = async () => {
        const result = await request.get('/commands/policy_asset_group_all');
        if (result.code === 1) {
            this.setState({
                allAssetGroupData:result.data
            })
        } else {
            message.error(result.message);
        }
    }

    handleByAssetGroup = async (record) => {
        await this.handleGetAssetGroup()
        const result = await request.get(`/commands/policy_asset_group_paging?policyId=${record.id}`);
        const items=[]
        if (result.code === 1) {
            result.data = result.data ?result.data :[]
            result.data.forEach(item => {
                items.push(item.id)
            })
            this.setState({
                selectedAssetGroup:items
            })
        } else {
            message.error(result.message);
        }
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

    //第二个页面
    async loadTableData2(queryParams) {
        this.setState({
            loading2: true
        });

        queryParams = queryParams || this.state.queryParams2;

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/commands/set_paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items ? data.items:[]
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items2: items,
                total2: data.total,
                queryParams2: queryParams,
                loading2: false
            });
        }
    }

    handleChangPage2 = async (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams2;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams2: queryParams
        });

        await this.loadTableData2(queryParams)
    };

    handleTableChange2 = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams2,
            'order': sorter.order,
            'field': sorter.field
        }
        this.loadTableData2(query);
    }

    handleSearch2 = async (values) => {
        let query = {
            ...this.state.queryParams2,
            'pageIndex': 1,
            'pageSize': this.state.queryParams2.pageSize,
            'name': values.name,
        }
        this.loadTableData2(query);
    };

    async delete2(id) {
        const result = await request.delete('/commands/set_delete/' + id);
        if (result.code === 1) {
            message.success('删除成功');
            await this.loadTableData2(this.state.queryParams2);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }
    }

    showDeleteConfirm2(id, content) {
        let self = this;
        confirm({
            title: '您确定要删除此项吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete2(id);
            }
        });
    };

    batchDelete2 = async () => {
        this.setState({
            delBtnLoading2: true
        })
        try {
            let result = await request.delete('/commands/set_delete/' + this.state.selectedRowKeys2.join(','));
            if (result.code === 1) {
                message.success(result.message, 3);
                this.setState({
                    selectedRowKeys2: []
                })
                await this.loadTableData2(this.state.queryParams2);
            } else {
                message.error('删除失败: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading2: false
            })
        }
    }

    showModal2(title, obj = null) {
        this.setState({
            modalTitle2: title,
            modalVisible2: true,
            model2: obj
        });
    };

    handleCancelModal2 = e => {
        this.setState({
            modalTitle2: '',
            modalVisible2: false
        });
    };

    handleOk2 = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading2: true
        });

        if (formData.id) {
            // 编辑
            const result = await request.put('/commands/set_update/' + formData.id, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible2: false
                });
                this.loadTableData2(this.state.queryParams2);
            } else {
                message.error('更新失败: ' + result.message, 10);
            }
        } else {
            // 新增
            const result = await request.post('/commands/set_create', formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible2: false
                });
                this.loadTableData2(this.state.queryParams2);
            } else {
                message.error('新增失败: ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading2: false
        });
    };

    selectDataAll2 = () =>{
        if(this.state.items2.length === this.state.selectedRowKeys2.length){
            this.setState({
                selectedRowKeys2: []
            })
        }else{
            const index2 = [];
            this.state.items2.forEach(item=>{
                index2.push(item.key)
            });
            this.setState({
                selectedRowKeys2: index2
            })
        }
    }


    //第三个页面
    async loadTableData3(queryParam,id) {
        this.setState({
            loading3: true
        });

        let queryParams = {
            ...queryParam,
            'id':id,
        };

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = []

        try {
            let result = await request.get('/commands/content_paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data = data ?data :[]
            const items = data.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items3: items,
                total3: data.length,
                loading3: false
            });
        }
    }

    handleChangPage3 = async (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams3;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        await this.loadTableData3(queryParams,this.state.currentRow['id'])
    };

    handleTableChange3 = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams3,
            'order': sorter.order,
            'field': sorter.field,
        }
        this.loadTableData3(query,this.state.currentRow['id']);
    }

    handleSearch3 = async (values) => {
        let query = {
            ...this.state.queryParams3,
            'pageIndex': 1,
            'pageSize': this.state.queryParams3.pageSize,
            'name': values.name,
        }
        this.loadTableData3(query,this.state.currentRow['id']);
    };

    async delete3(record) {
        const result = await request.delete(`/commands/content_delete?contentId=${this.state.currentRow['id']}&id=${record.id}`);
        if (result.code === 1) {
            message.success('删除成功');
            this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
        } else {
            message.error('删除失败: ' + result.message, 10);
        }
    }

    showDeleteConfirm3(record) {
        let self = this;
        confirm({
            title: '您确定要删除此项吗?',
            content: record.content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete3(record);
            }
        });
    };

    batchDelete3 = async () => {
        this.setState({
            delBtnLoading3: true
        })
        try {
            let result = await request.delete(`/commands/content_delete?contentId=${this.state.currentRow['id']}&id=${this.state.selectedRowKeys3.join(',')}`);
            if (result.code === 1) {
                message.success(result.message, 3);
                this.setState({
                    selectedRowKeys3: []
                })
                await this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
            } else {
                message.error('删除失败: ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading3: false
            })
        }
    }

    showModal3(title, obj = null) {
        this.setState({
            modalTitle3: title,
            modalVisible3: true,
            model3: obj
        });
    };

    handleCancelModal3 = e => {
        this.setState({
            modalTitle3: '',
            modalVisible3: false
        });
    };

    handleOk3 = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading3: true
        });
        if (formData.id) {
            // 编辑
            const result = await request.put(`/commands/content_update?contentId=${this.state.currentRow['id']}&id=${formData.id}`, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible3: false
                });
                this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
            } else {
                message.error('更新失败: ' + result.message, 10);
            }
        } else {
            // 新增
            const result = await request.post(`/commands/content_create?id=${this.state.currentRow['id']}`, formData);
            if (result.code === 1) {
                message.success(result.message);
                this.setState({
                    modalVisible3: false
                });
                this.loadTableData3(this.state.queryParams3,this.state.currentRow['id']);
            } else {
                message.error('新增失败: ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading3: false
        });
    };

    selectDataAll3 = () =>{
        if(this.state.items3.length === this.state.selectedRowKeys3.length){
            this.setState({
                selectedRowKeys3: []
            })
        }else{
            const index3 = [];
            this.state.items3.forEach(item=>{
                index3.push(item.key)
            });
            this.setState({
                selectedRowKeys3: index3
            })
        }
    }



    render() {

        const columns = [{
            title: '策略名称',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },{
            title: '优先级',
            dataIndex: 'priority',
            key: 'priority',
        },{
            title: '执行动作',
            dataIndex: 'policyType',
            key: 'policyType',
        }, {
            title: '描述',
            dataIndex: 'describe',
            key: 'describe',
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                if(text==="0"){
                    return "关闭"
                }else{
                    return "开启"
                }
            },
        }, {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return text
            },
            sorter: true,
        },{
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                const menu = (
                    <Menu>
                        <Menu.Item key="1">
                            <Button type="text" size='small'
                                    onClick={() => {
                                        this.setState({
                                            orderModalVisible: true,
                                            selectedRow: record
                                        })
                                        this.handleByOrder(record)
                                            .then(() => {
                                                this.changeOrderFormRef
                                                    .current
                                                    .setFieldsValue(this.state.dataForm)
                                            });
                                    }}>指令</Button>
                        </Menu.Item>

                        <Menu.Item key="2">
                            <Button type="text" size='small'
                                    onClick={() => {
                                        this.setState({
                                            orderSetModalVisible: true,
                                            selectedRow: record
                                        })
                                        this.handleByOrderSet(record)
                                            .then(() => {
                                                this.changeOrderSetFormRef
                                                    .current
                                                    .setFieldsValue({
                                                        commandSetIds:this.state.selectedSets
                                                    })
                                            });
                                    }}>指令集</Button>
                        </Menu.Item>

                        <Menu.Item key="3">
                            <Button type="text" size='small'
                                    onClick={() => {
                                        this.setState({
                                            userModalVisible: true,
                                            selectedRow: record
                                        })
                                        this.handleByUser(record)
                                            .then(() => {
                                                this.changeUserFormRef
                                                    .current
                                                    .setFieldsValue({
                                                        userIds:this.state.selectedUsers
                                                    })
                                            });
                                    }}>用户</Button>
                        </Menu.Item>

                        <Menu.Item key="4">
                            <Button type="text" size='small'
                                    onClick={() => {
                                        this.setState({
                                            userGroupModalVisible: true,
                                            selectedRow: record
                                        })
                                        this.handleByUserGroup(record)
                                            .then(() => {
                                                this.changeUserGroupFormRef
                                                    .current
                                                    .setFieldsValue({
                                                        userGroupIds:this.state.selectedUserGroups
                                                    })
                                            });
                                    }}>用户组</Button>
                        </Menu.Item>

                        <Menu.Item key="5">
                            <Button type="text" size='small'
                                    onClick={() => {
                                        this.setState({
                                            changeAssetVisible: true,
                                            selectedRow: record
                                        })
                                        this.handleByAsset(record)
                                            .then(() => {
                                                this.changeAssetFormRef
                                                    .current
                                                    .setFieldsValue({
                                                        assetIds:this.state.selectedAssets
                                                    })
                                            });
                                    }}>主机</Button>
                        </Menu.Item>

                        <Menu.Item key="6">
                            <Button type="text" size='small'
                                    onClick={() => {
                                        this.setState({
                                            changeAssetGroupVisible: true,
                                            selectedRow: record
                                        })
                                        this.handleByAssetGroup(record)
                                            .then(() => {
                                                this.changeAssetGroupFormRef
                                                    .current
                                                    .setFieldsValue({
                                                        assetGroupId:this.state.selectedAssetGroup
                                                    })
                                            });
                                    }}>主机组</Button>
                        </Menu.Item>
                    </Menu>
                );

                let status1= record.status
                if(status1==='0'){
                    status1 = false
                }else {
                    status1 = true
                }

                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={() => this.showModal('编辑策略', record)}>编辑</Button>

                        <Dropdown overlay={menu}>
                            <Button type="link" size='small'>
                                关联 <DownOutlined/>
                            </Button>
                        </Dropdown>

                        <Switch size="small" checkedChildren="启用" unCheckedChildren="禁用" checked={status1}
                                onChange={async (checked) => {
                                    let result = await request.put(`/commands/policy_change_status/${record['id']}?status=${checked}`);
                                    if (result['code'] === 1) {
                                        message.success(result['message']);
                                        await this.loadTableData();
                                    } else {
                                        message.error(result['message']);
                                    }
                                }}
                        />

                        <Button type="text" size='small' danger
                                onClick={() => this.showDeleteConfirm(record.id, record.name)}>删除</Button>
                    </div>
                )
            },
        }
        ];
        const rowSelection = {
            hideSelectAll:true,
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = this.state.selectedRowKeys.length > 0;
        let isChecked = false
        if(this.state.items.length!==0 && this.state.items.length === this.state.selectedRowKeys.length){
            isChecked = true
        }else {
            isChecked = false
        }


        const columns2 = [{
            title: '指令集名称',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },{
            title: '指令/参数',
            dataIndex: 'content',
            key: 'content',
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        }, {
            title: '描述',
            dataIndex: 'describe',
            key: 'describe',
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        },  {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
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
                                onClick={async () =>{
                                    await this.loadTableData3(this.state.queryParams3,record.id)
                                    this.setState({
                                        tabModalVisible : true,
                                        currentRow : record
                                    })
                                }}>管理</Button>

                        <Button type="link" size='small'
                                onClick={() => this.showModal2('编辑指令集', record)}>编辑</Button>

                        {
                            record.name === '高危命令集' || record.name === '非法命令集' ?
                                undefined :<Button type="text" size='small' danger
                                         onClick={() => this.showDeleteConfirm2(record.id, record.name)}>删除</Button>
                        }

                    </div>
                )
            },
        }
        ];
        const rowSelection2 = {
            hideSelectAll:true,
            selectedRowKeys: this.state.selectedRowKeys2,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys2:selectedRowKeys});
            },
        };
        const hasSelected2 = this.state.selectedRowKeys2.length > 0;
        let isChecked2 = false
        if(this.state.items2.length!==0 && this.state.items2.length === this.state.selectedRowKeys2.length){
            isChecked2 = true
        }else {
            isChecked2 = false
        }

        const columns3 = [{
            title: '指令名称',
            dataIndex: 'content',
            key: 'content',
            sorter: true,
        },{
            title: '是否正则',
            dataIndex: 'regular',
            key: 'regular',
            render: (text, record) => {
                if(text===false){
                    return "否"
                }else{
                    return "是"
                }
            },
        }, {
            title: '描述',
            dataIndex: 'describe',
            key: 'describe',
            ellipsis: {
                showTitle: false,
            },
            render: (text, record) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        }, {
            title: '操作',
            key: 'action',
            render: (text, record, index) => {

                return (
                    <div>
                        <Button type="link" size='small'
                                onClick={() => this.showModal3('编辑指令', record)}>编辑</Button>

                        <Button type="text" size='small' danger
                                onClick={() => this.showDeleteConfirm3(record)}>删除</Button>

                    </div>
                )
            },
        }
        ];
        const rowSelection3 = {
            hideSelectAll:true,
            selectedRowKeys: this.state.selectedRowKeys3,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys3:selectedRowKeys
                });
            },
        };
        const hasSelected3 = this.state.selectedRowKeys3.length > 0;
        let isChecked3 = false
        if(this.state.items3.length!==0 && this.state.items3.length === this.state.selectedRowKeys3.length){
            isChecked3 = true
        }else {
            isChecked3 = false
        }


        return (
            <>
                <Content className="site-layout-background page-content">
                    <Text italic style={{fontSize:20,color:'#666'}}>指令控制</Text>
                    <Tabs type="card" onChange={this.handleOnTabChange} style={{marginTop:20}}>
                        <TabPane tab="策略列表" key="1">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:0}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.taticFormRef} name="taticForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="name"
                                                label="任务名称"
                                            >
                                                <Input type='text' placeholder="请输入任务名称" />
                                            </Form.Item>

                                            <Form.Item {...formTailLayout} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    搜索
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {
                                                            this.taticFormRef.current.resetFields();
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
                                            <Button type="primary"
                                                    onClick={() => this.showModal('新增策略', {policyType:"指令阻断"})}>新增
                                            </Button>

                                            <Button style={{backgroundColor:'#F7F7F7'}}
                                                    onClick={() => { this.loadTableData(this.state.queryParams)}}>刷新
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>

                            <Table
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
                                loading={this.state.loading}
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

                            {
                                this.state.modalVisible ?
                                    <PolicyListModal
                                        visible={this.state.modalVisible}
                                        title={this.state.modalTitle}
                                        handleOk={this.handleOk}
                                        handleCancel={this.handleCancelModal}
                                        confirmLoading={this.state.modalConfirmLoading}
                                        model={this.state.model}
                                    >
                                    </PolicyListModal> : undefined
                            }

                            {

                                this.state.orderModalVisible?
                                    <Modal title={<Text>「<strong>{this.state.selectedRow['name']}</strong>」关联指令</Text>}
                                           visible={this.state.orderModalVisible}
                                           confirmLoading={this.state.orderConfirmLoading}
                                           maskClosable={false}
                                           onOk={() => {
                                               this.setState({
                                                   orderConfirmLoading: true
                                               });

                                               this.changeOrderFormRef.current
                                                   .validateFields()
                                                   .then(async values => {
                                                       const result = await request.post(`/commands/policy_content_create?policyId=${this.state.selectedRow['id']}`,values);
                                                       if (result.code === 1) {
                                                           message.success(result.message);
                                                           await this.loadTableData(this.state.queryParams);
                                                       } else {
                                                           message.error(result.message, 10);
                                                           this.setState({
                                                               orderModalVisible: false
                                                           });
                                                       }

                                                   })
                                                   .catch(info => {

                                                   })
                                                   .finally(() => {
                                                       this.setState({
                                                           orderModalVisible: false,
                                                           orderConfirmLoading: false
                                                       })
                                                   });
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   orderModalVisible: false
                                               })
                                           }}
                                           centered={true}
                                           cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                    >

                                        <Form ref={this.changeOrderFormRef}>
                                            <Form.Item label="指令/参数" name='content'>
                                                <TextArea style={{height:200}} placeholder="一行一个指令" />
                                            </Form.Item>
                                        </Form>
                                    </Modal> :undefined
                            }

                            {
                                this.state.orderSetModalVisible?
                                    <Modal title={<Text>关联指令集「<strong>{this.state.selectedRow['name']}</strong>」</Text>}
                                           visible={this.state.orderSetModalVisible}
                                           confirmLoading={this.state.orderSetConfirmLoading}
                                           maskClosable={false}
                                           onOk={() => {
                                               this.setState({
                                                   orderSetConfirmLoading: true
                                               });

                                               this.changeOrderSetFormRef.current
                                                   .validateFields()
                                                   .then(async values => {
                                                       if (values['commandSetIds']) {
                                                           values['commandSetIds'] = values['commandSetIds'].join(',');
                                                       }
                                                       const result = await request.post(`/commands/policy_set_add?commandSetId=${values['commandSetIds']}&policyId=${this.state.selectedRow['id']}`);
                                                       if (result.code === 1) {
                                                           message.success('操作成功');
                                                           await this.loadTableData(this.state.queryParams);
                                                       } else {
                                                           message.error( result.message, 10);
                                                           this.setState({
                                                               orderSetModalVisible: false
                                                           });
                                                       }

                                                   })
                                                   .catch(info => {

                                                   })
                                                   .finally(() => {
                                                       this.setState({
                                                           orderSetModalVisible: false,
                                                           orderSetConfirmLoading: false
                                                       })
                                                   });
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   orderSetModalVisible: false
                                               })
                                           }}
                                           centered={true}
                                           cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                    >

                                        <Form ref={this.changeOrderSetFormRef}>
                                            <Form.Item label="关联指令集" name='commandSetIds'>
                                                <Select
                                                    mode="multiple"
                                                    allowClear
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择关联指令集"
                                                >
                                                    {this.state.allSetsData.map(d => <Select.Option key={d.id}
                                                                                                    value={d.id}>{d.name}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Form>
                                    </Modal>:undefined
                            }

                            {
                                this.state.userModalVisible?
                                    <Modal title={<Text>关联用户「<strong>{this.state.selectedRow['name']}</strong>」</Text>}
                                           visible={this.state.userModalVisible}
                                           confirmLoading={this.state.userConfirmLoading}
                                           maskClosable={false}
                                           onOk={() => {
                                               this.setState({
                                                   userConfirmLoading: true
                                               });

                                               this.changeUserFormRef.current
                                                   .validateFields()
                                                   .then(async values => {
                                                       if (values['userIds']) {
                                                           values['userIds'] = values['userIds'].join(',');
                                                       }
                                                       const result = await request.post(`/commands/policy_user_add?userId=${values['userIds']}&policyId=${this.state.selectedRow['id']}`);
                                                       if (result.code === 1) {
                                                           message.success('操作成功');
                                                           await this.loadTableData(this.state.queryParams);
                                                       } else {
                                                           message.error( result.message, 10);
                                                           this.setState({
                                                               userModalVisible: false
                                                           });
                                                       }

                                                   })
                                                   .catch(info => {

                                                   })
                                                   .finally(() => {
                                                       this.setState({
                                                           userModalVisible: false,
                                                           userConfirmLoading: false
                                                       })
                                                   });
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   userModalVisible: false
                                               })
                                           }}
                                           centered={true}
                                           cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                    >

                                        <Form ref={this.changeUserFormRef}>
                                            <Form.Item label="关联用户" name='userIds'>
                                                <Select
                                                    mode="multiple"
                                                    allowClear
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择关联用户"
                                                >
                                                    {this.state.allUsersData.map(d => <Select.Option key={d.id}
                                                                                                     value={d.id}>{d.username}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Form>
                                    </Modal>:undefined
                            }


                            {
                                this.state.userGroupModalVisible?
                                    <Modal title={<Text>关联用户组「<strong>{this.state.selectedRow['name']}</strong>」</Text>}
                                           visible={this.state.userGroupModalVisible}
                                           confirmLoading={this.state.userGroupConfirmLoading}
                                           maskClosable={false}
                                           onOk={() => {
                                               this.setState({
                                                   userGroupConfirmLoading: true
                                               });

                                               this.changeUserGroupFormRef.current
                                                   .validateFields()
                                                   .then(async values => {
                                                       if (values['userGroupIds']) {
                                                           values['userGroupIds'] = values['userGroupIds'].join(',');
                                                       }
                                                       const result = await request.post(`/commands/policy_user_group_add?userGroupId=${values['userGroupIds']}&policyId=${this.state.selectedRow['id']}`);
                                                       if (result.code === 1) {
                                                           message.success('操作成功');
                                                           await this.loadTableData(this.state.queryParams);
                                                       } else {
                                                           message.error( result.message, 10);
                                                           this.setState({
                                                               userGroupModalVisible: false
                                                           });
                                                       }

                                                   })
                                                   .catch(info => {

                                                   })
                                                   .finally(() => {
                                                       this.setState({
                                                           userGroupModalVisible: false,
                                                           userGroupConfirmLoading: false
                                                       })
                                                   });
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   userGroupModalVisible: false
                                               })
                                           }}
                                           centered={true}
                                           cancelButtonProps={{ style: { backgroundColor: '#F7F7F7' } }}
                                    >

                                        <Form ref={this.changeUserGroupFormRef}>
                                            <Form.Item label="关联用户组" name='userGroupIds'>
                                                <Select
                                                    mode="multiple"
                                                    allowClear
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择关联用户组"
                                                >
                                                    {this.state.allUserGroupsData.map(d => <Select.Option key={d.id}
                                                                                                          value={d.id}>{d.name}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Form>
                                    </Modal>
                                    :undefined
                            }


                            {
                                this.state.changeAssetVisible?
                                    <Modal title={<Text>关联主机「<strong>{this.state.selectedRow['name']}</strong>」</Text>}
                                           visible={this.state.changeAssetVisible}
                                           confirmLoading={this.state.changeAssetConfirmLoading}
                                           maskClosable={false}
                                           onOk={() => {
                                               this.setState({
                                                   changeAssetConfirmLoading: true
                                               });

                                               this.changeAssetFormRef.current
                                                   .validateFields()
                                                   .then(async values => {
                                                       if (values['assetIds']) {
                                                           values['assetIds'] = values['assetIds'].join(',');
                                                       }
                                                       const result = await request.post(`/commands/policy_asset_add?assetId=${values['assetIds']}&policyId=${this.state.selectedRow['id']}`);
                                                       if (result.code === 1) {
                                                           message.success('操作成功');
                                                           await this.loadTableData(this.state.queryParams);
                                                       } else {
                                                           message.error( result.message, 10);
                                                           this.setState({
                                                               changeAssetVisible: false
                                                           });
                                                       }

                                                   })
                                                   .catch(info => {

                                                   })
                                                   .finally(() => {
                                                       this.setState({
                                                           changeAssetVisible: false,
                                                           changeAssetConfirmLoading: false
                                                       })
                                                   });
                                           }}
                                           onCancel={() => {
                                               this.setState({
                                                   changeAssetVisible: false
                                               })
                                           }}>

                                        <Form ref={this.changeAssetFormRef}>

                                            <Form.Item label="关联主机" name='assetIds'>
                                                <Select
                                                    mode="multiple"
                                                    allowClear
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择关联主机"
                                                >
                                                    {this.state.allAssetsData.map(d => <Select.Option key={d.id}
                                                                                                      value={d.id}>{d.name}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Form>
                                    </Modal>:undefined
                            }

                            {
                                this.state.changeAssetGroupVisible?
                                    <Modal title={<Text>关联主机组「<strong>{this.state.selectedRow['name']}</strong>」</Text>}
                                           visible={this.state.changeAssetGroupVisible}
                                           confirmLoading={this.state.changeAssetGroupConfirmLoading}
                                           maskClosable={false}
                                           onOk={() => {
                                               this.setState({
                                                   changeAssetGroupConfirmLoading: true
                                               });

                                               this.changeAssetGroupFormRef.current
                                                   .validateFields()
                                                   .then(async values => {
                                                       if (values['assetGroupId']) {
                                                           values['assetGroupId'] = values['assetGroupId'].join(',');
                                                       }
                                                       const result = await request.post(`/commands/policy_asset_group_add?assetGroupId=${values['assetGroupId']}&policyId=${this.state.selectedRow['id']}`);
                                                       if (result.code === 1) {
                                                           message.success('操作成功');
                                                           await this.loadTableData(this.state.queryParams);
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

                                            <Form.Item label="关联主机组" name='assetGroupId'>
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
                                    </Modal>:undefined
                            }

                        </TabPane>
                        <TabPane tab="指令集" key="2">
                            <div>
                                <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:0}}>
                                    <Col span={14} key={1}>
                                        <Form ref={this.commandsFormRef} name="commandsForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch2}>
                                            <Form.Item
                                                {...formItemLayout}
                                                name="name"
                                                label="指令集名称"
                                            >
                                                <Input type='text' placeholder="请输入指令集名称" />
                                            </Form.Item>

                                            <Form.Item {...formTailLayout} className="search">
                                                <Button type="primary" htmlType="submit">
                                                    搜索
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {
                                                            this.commandsFormRef.current.resetFields();
                                                            this.loadTableData2({
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
                                                    onClick={() => this.showModal2('新建指令集',{})}>新增
                                            </Button>

                                            <Button style={{backgroundColor:'#F7F7F7'}}
                                                    onClick={() => { this.loadTableData2(this.state.queryParams)}}>刷新
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>

                            <Table
                                rowSelection={rowSelection2}
                                dataSource={this.state.items2}
                                columns={columns2}
                                position={'both'}
                                pagination={{
                                    showSizeChanger: true,
                                    current: this.state.queryParams2.pageIndex,
                                    pageSize: this.state.queryParams2.pageSize,
                                    onChange: this.handleChangPage2,
                                    onShowSizeChange: this.handleChangPage2,
                                    total: this.state.total2,
                                    showTotal: total => `总计 ${total} 条`
                                }}
                                loading={this.state.loading2}
                                onChange={this.handleTableChange2}
                                bordered
                                size={'small'}
                            />

                            <div style={{margin:'-45px 0px 0 17px'}}>
                                <Checkbox style={{marginRight:17}} onChange={this.selectDataAll2} checked={isChecked2} />
                                <Button type="primary" danger disabled={!hasSelected2}
                                        loading={this.state.delBtnLoading2}
                                        onClick={() => {
                                            const content = <div>
                                                您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                               strong>{this.state.selectedRowKeys2.length}</Text>条记录吗？
                                            </div>;
                                            confirm({
                                                icon: <ExclamationCircleOutlined/>,
                                                content: content,
                                                onOk: () => {
                                                    this.batchDelete2()
                                                },
                                                onCancel() {

                                                },
                                            });
                                        }}>批量删除
                                </Button>

                            </div>

                            {
                                this.state.modalVisible2 ?
                                    <OrderSetsModal
                                        visible={this.state.modalVisible2}
                                        title={this.state.modalTitle2}
                                        handleOk={this.handleOk2}
                                        handleCancel={this.handleCancelModal2}
                                        confirmLoading={this.state.modalConfirmLoading2}
                                        model={this.state.model2}
                                    >
                                    </OrderSetsModal> : undefined
                            }

                            <Modal title={<Text>指令集管理「<strong>{this.state.currentRow['name']}</strong>」</Text>}
                                   visible={this.state.tabModalVisible}
                                   style={{top:30}}
                                   width={1300}
                                   footer={null}
                                   onCancel={()=>{this.setState({tabModalVisible:false})} }
                                   centered={true}
                            >
                                <div>
                                    <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 20px 0'}}>
                                        <Col span={14} key={1}>
                                            <Form ref={this.commandFormRef} name="commandForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch3}>
                                                <Form.Item
                                                    {...formItemLayout}
                                                    name="name"
                                                    label="指令名称"
                                                >
                                                    <Input type='text' placeholder="请输入指令名称" />
                                                </Form.Item>

                                                <Form.Item {...formTailLayout} className="search">
                                                    <Button type="primary" htmlType="submit">
                                                        搜索
                                                    </Button>

                                                    <Button style={{backgroundColor:'#F7F7F7'}}
                                                            onClick={() => {
                                                                this.commandFormRef.current.resetFields();
                                                                this.loadTableData3(this.state.queryParams3,this.state.currentRow['id'])
                                                            }}>重置查询
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        </Col>
                                        <Col span={10} key={2} style={{textAlign: 'right'}}>
                                            <Space>
                                                <Button type="primary"
                                                        onClick={() => this.showModal3('新建指令',{})}>新增
                                                </Button>

                                                <Button style={{backgroundColor:'#F7F7F7'}}
                                                        onClick={() => {this.loadTableData3(this.state.queryParams3,this.state.currentRow['id'])}}>刷新
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                </div>

                                <Table
                                    rowSelection={rowSelection3}
                                    dataSource={this.state.items3}
                                    columns={columns3}
                                    position={'both'}
                                    scroll={{y:500}}
                                    pagination={{
                                        showSizeChanger: true,
                                        current: this.state.queryParams3.pageIndex,
                                        pageSize: this.state.queryParams3.pageSize,
                                        onChange: this.handleChangPage3,
                                        onShowSizeChange: this.handleChangPage3,
                                        total: this.state.total3,
                                        showTotal: total => `总计 ${total} 条`
                                    }}
                                    loading={this.state.loading3}
                                    onChange={this.handleTableChange3}
                                    bordered
                                    size={'small'}
                                />

                                <div style={{margin:'-45px 0px -6px 17px'}}>
                                    <Checkbox style={{marginRight:17}} onChange={this.selectDataAll3} checked={isChecked3} />
                                    <Button type="primary" danger disabled={!hasSelected3}
                                            loading={this.state.delBtnLoading3}
                                            onClick={() => {
                                                const content = <div>
                                                    您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                                   strong>{this.state.selectedRowKeys3.length}</Text>条记录吗？
                                                </div>;
                                                confirm({
                                                    icon: <ExclamationCircleOutlined/>,
                                                    content: content,
                                                    onOk: () => {
                                                        this.batchDelete3()
                                                    },
                                                    onCancel() {

                                                    },
                                                });
                                            }}>批量删除
                                    </Button>
                                </div>

                                {
                                    this.state.modalVisible3 ?
                                        <OrderContentModal
                                            visible={this.state.modalVisible3}
                                            title={this.state.modalTitle3}
                                            handleOk={this.handleOk3}
                                            handleCancel={this.handleCancelModal3}
                                            confirmLoading={this.state.modalConfirmLoading3}
                                            model={this.state.model3}
                                        >
                                        </OrderContentModal> : undefined
                                }

                            </Modal>

                        </TabPane>
                    </Tabs>
                </Content>
            </>
        );
    }
}

export default CommandControl;
