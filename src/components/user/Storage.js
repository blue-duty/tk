import React, {Component} from 'react';
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Drawer, Form,
    Input,
    Layout,
    List,
    Popconfirm,
    Row,
    Space,
    Typography
} from "antd";
import {FireOutlined, HeartOutlined, SafetyCertificateOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";
import request from "../../common/request";
import {message} from "antd/es";
import qs from "qs";
import {cloneObj, renderSize} from "../../utils/utils";
import FileSystem from "../access/FileSystem";
import StorageModal from "./StorageModal";

const {Content} = Layout;
const {Text} = Typography;
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16},
};
const formTailLayout = {
    wrapperCol:{ offset: 3, span:18 }
};

class Storage extends Component {

    storageFormRef = React.createRef();
    storageRef = undefined;

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
        selectedRow: undefined,
        fileSystemVisible: false,
        storageId: undefined
    };

    componentDidMount() {
        this.loadTableData();
    }

    async delete(id) {
        const result = await request.delete('/storages/' + id);
        if (result.code === 1) {
            message.success('删除成功');
            this.loadTableData(this.state.queryParams);
        } else {
            message.error(result.message, 10);
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
            let result = await request.get(`/storages/paging?${paramsStr}`);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            data.items = data.items ? data.items:[]
            this.setState({
                items: data.items,
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


    onRef = (storageRef) => {
        this.storageRef = storageRef;
    }

    //搜索
    handleSearch = async (values) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': values.name,
        }
        this.loadTableData(query)
    }

    showModal(title, obj = undefined) {
        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: obj
        });
    };

    handleOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });

        if (formData.id) {
            // 转换文件大小限制单位为字节
            formData['limitSize'] = parseInt(formData['limitSize']) * 1024 * 1024;
            // 向后台提交数据
            const result = await request.put('/storages/' + formData.id, formData);
            if (result.code === 1) {
                message.success('更新成功');

                this.setState({
                    modalVisible: false
                });
                this.loadTableData(this.state.queryParams);
            } else {
                message.error('更新失败 : ' + result.message, 10);
            }
        } else {
            // 转换文件大小限制单位为字节
            formData['limitSize'] = parseInt(formData['limitSize']) * 1024 * 1024;
            // 向后台提交数据
            const result = await request.post('/storages', formData);
            if (result.code === 1) {
                message.success('新增成功');

                this.setState({
                    modalVisible: false
                });
                this.loadTableData(this.state.queryParams);
            } else {
                message.error('新增失败 : ' + result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    render() {

        return (
            <Content className="site-layout-background page-content">
                <div>
                    <Text italic style={{fontSize:20,color:'#666'}}>用户空间</Text>
                    <Divider />
                    <Row justify="space-around" gutter={{ xs: 8, sm: 16, md: 24}} style={{margin:'0 0 10px 0'}}>
                        <Col span={14} key={1}>
                            <Form ref={this.storageFormRef} name="storageForm" layout="horizontal" labelAlign="left" onFinish={this.handleSearch}>
                                <Form.Item
                                    {...formItemLayout}
                                    name="name"
                                    label="名称"
                                >
                                    <Input type='text' placeholder="请输入名称" />
                                </Form.Item>

                                <Form.Item {...formTailLayout} className="search">
                                    <Button type="primary" htmlType="submit">
                                        搜索
                                    </Button>

                                    <Button style={{backgroundColor:'#F7F7F7'}}
                                            onClick={() => {
                                                this.storageFormRef.current.resetFields();
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
                                        onClick={() => this.showModal('新增用户空间')}>新增
                                </Button>

                                <Button style={{backgroundColor:'#F7F7F7'}}
                                        onClick={() => { this.loadTableData(this.state.queryParams)}}>刷新
                                </Button>

                            </Space>
                        </Col>
                    </Row>
                </div>

                <List
                    loading={this.state.loading}
                    grid={{gutter: 16, column: 4}}
                    dataSource={this.state.items}
                    pagination={{
                        showSizeChanger: true,
                        current: this.state.queryParams.pageIndex,
                        pageSize: this.state.queryParams.pageSize,
                        onChange: this.handleChangPage,
                        onShowSizeChange: this.handleChangPage,
                        total: this.state.total,
                        showTotal: total => `总计 ${total} 条`,
                    }}
                    renderItem={item => {
                        let delBtn;
                        if (item['isDefault']) {
                            delBtn = <Button type="text" size='small' disabled danger>删除</Button>
                        } else {
                            delBtn = <Popconfirm
                                title="您确认要删除此空间吗?"
                                onConfirm={() => {
                                    this.delete(item['id']);
                                }}
                                okText="是"
                                cancelText="否"
                            >
                                <Button type="text" size='small' danger>删除</Button>
                            </Popconfirm>
                        }
                        return (
                            <List.Item>
                                <Card title={item['name']}
                                      style={{backgroundColor:"#F7F7F7"}}
                                      hoverable
                                      size={"small"}
                                      actions={[
                                          <Button type="link" size='small' onClick={() => {
                                              this.setState({
                                                  fileSystemVisible: true,
                                                  storageId: item['id']
                                              });
                                              if (this.storageRef) {
                                                  this.storageRef.reSetStorageId(item['id']);
                                              }
                                          }}>文件管理</Button>,
                                          <Button type="link" size='small' onClick={() => {
                                              // 转换文件大小限制单位为MB
                                              let model = cloneObj(item);
                                              if(model['limitSize'] > 0){
                                                  model['limitSize'] = model['limitSize'] / 1024 / 1024;
                                              }
                                              this.showModal('修改用户空间', model);
                                          }}>编辑</Button>,
                                          delBtn
                                          ,
                                      ]}>
                                    <Descriptions title="" column={1} bordered size={"small"}>
                                        <Descriptions.Item label={<div><TeamOutlined/> 是否共享</div>}>
                                            <strong>{item['isShare'] ? '是' : '否'}</strong>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<div><SafetyCertificateOutlined/> 是否默认</div>}>
                                            <strong>{item['isDefault'] ? '是' : '否'}</strong>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<div><FireOutlined/> 大小限制</div>}>
                                            <strong>{item['limitSize'] < 0 ? '无限制' : renderSize(item['limitSize'])}</strong>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<div><HeartOutlined/> 已用大小</div>}>
                                            <strong>{renderSize(item['usedSize'])}</strong>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<div><UserOutlined/> 所属用户</div>}>
                                            <strong>{item['ownerName']}</strong>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </List.Item>
                        )
                    }}
                />

                <Drawer
                    title={'文件管理'}
                    placement="right"
                    width={window.innerWidth * 0.8}
                    closable={true}
                    maskClosable={true}
                    onClose={() => {
                        this.setState({
                            fileSystemVisible: false
                        });
                        this.loadTableData(this.state.queryParams);
                    }}
                    visible={this.state.fileSystemVisible}
                >
                    <FileSystem
                        storageId={this.state.storageId}
                        storageType={'storages'}
                        onRef={this.onRef}
                        upload={true}
                        download={true}
                        delete={true}
                        rename={true}
                        edit={true}
                        minHeight={window.innerHeight - 103}/>
                </Drawer>

                {
                    this.state.modalVisible ?
                        <StorageModal
                            visible={this.state.modalVisible}
                            title={this.state.modalTitle}
                            handleOk={this.handleOk}
                            handleCancel={() => {
                                this.setState({
                                    modalTitle: '',
                                    modalVisible: false
                                });
                            }}
                            confirmLoading={this.state.modalConfirmLoading}
                            model={this.state.model}
                        >
                        </StorageModal> : undefined
                }
            </Content>

        );
    }
}

export default Storage;
