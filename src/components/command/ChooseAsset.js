import React, {Component} from 'react';

import {
    Badge,
    Button,
    Col,
    Divider,
    Input,
    Layout,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {message} from "antd/es";


import { SyncOutlined, UndoOutlined} from '@ant-design/icons';
import {PROTOCOL_COLORS} from "../../common/constants";
import {isEmpty} from "../../utils/utils";
import dayjs from "dayjs";

const {Search} = Input;
const {Content} = Layout;
const {Title} = Typography;

class ChooseAsset extends Component {

    inputRefOfName = React.createRef();
    inputRefOfIp = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            protocol: 'ssh'
        },
        loading: false,
        tags: [],
        model: {},
        selectedRowKeys: [],
        selectedRows: [],
        delBtnLoading: false,
        changeOwnerModalVisible: false,
        changeSharerModalVisible: false,
        changeOwnerConfirmLoading: false,
        changeSharerConfirmLoading: false,
        users: [],
        selected: {},
        totalSelectedRows: [],
    };

    checkedAssets = undefined

    async componentDidMount() {
        this.checkedAssets = this.props.setCheckedAssets;
        this.loadTableData();
        let result = await request.get('/tags');
        if (result['code'] === 1) {
            this.setState({
                tags: result['data']
            })
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
            let sharer = this.state.sharer;
            const items = data.items.map(item => {
                let disabled = false;
                if (sharer === item['owner']) {
                    disabled = true;
                }
                return {...item, 'key': item['id'], 'disabled': disabled}
            })
            let totalSelectedRows = this.state.totalSelectedRows;
            let selectedRowKeys = totalSelectedRows.map(item => item['id']);
            this.setState({
                items: items,
                total: data.total,
                queryParams: queryParams,
                loading: false,
                selectedRowKeys: selectedRowKeys
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

    handleSearchByName = name => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': name,
        }

        this.loadTableData(query);
    };

    handleSearchByIp = ip => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'ip': ip,
        }

        this.loadTableData(query);
    };

    handleTagsChange = tags => {
        // this.setState({
        //     tags: tags
        // })
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'tags': tags.join(','),
        }

        this.loadTableData(query);
    }

    unSelectRow = async (assetId) => {
        const selectedRowKeys = this.state.selectedRowKeys.filter(key => key !== assetId);
        const totalSelectedRows = this.state.totalSelectedRows.filter(item => item['id'] !== assetId);
        this.setState({
            selectedRowKeys: selectedRowKeys,
            totalSelectedRows: totalSelectedRows
        })
        if (this.checkedAssets) {
            this.checkedAssets(totalSelectedRows);
        }
    }

    render() {

        const columns = [{
            title: '??????',
            dataIndex: 'id',
            key: 'id',
            render: (id, record, index) => {
                return index + 1;
            }
        }, {
            title: '????????????',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                let short = name;
                if (short && short.length > 20) {
                    short = short.substring(0, 20) + " ...";
                }
                return (
                    <Tooltip placement="topLeft" title={name}>
                        {short}
                    </Tooltip>
                );
            }
        }, {
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
                        tagDocuments.push(<Tag>{tagArr[i]}</Tag>)
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
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            }
        },
        ];

        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys, selectedRows});

                let totalSelectedRows = this.state.totalSelectedRows;
                let totalSelectedRowKeys = totalSelectedRows.map(item => item['id']);
                for (let i = 0; i < selectedRows.length; i++) {
                    let selectedRow = selectedRows[i];
                    if (totalSelectedRowKeys.includes(selectedRow['id'])) {
                        continue;
                    }
                    totalSelectedRows.push(selectedRow);
                }

                this.setState({
                    totalSelectedRows: totalSelectedRows
                })
                if (this.checkedAssets) {
                    this.checkedAssets(totalSelectedRows);
                }
            },
            getCheckboxProps: (record) => ({
                disabled: record['disabled'],
            }),
        };

        return (
            <>
                <Title level={3}>?????????????????????</Title>
                <div>
                    {
                        this.state.totalSelectedRows.map(item => {
                            return <Tag color={PROTOCOL_COLORS[item['protocol']]} closable
                                        onClose={() => this.unSelectRow(item['id'])}
                                        key={item['id']}>{item['name']}</Tag>
                        })
                    }
                </div>

                <Divider/>
                <Content key='page-content' className="site-layout-background">
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={{ xs: 8, sm: 16, md: 24}}>
                            <Col span={4} key={1}>
                                <Title level={3}>??????????????????</Title>
                            </Col>
                            <Col span={20} key={2} style={{textAlign: 'right'}}>
                                <Space>

                                    <Search
                                        ref={this.inputRefOfName}
                                        placeholder="????????????"
                                        allowClear
                                        onSearch={this.handleSearchByName}
                                        style={{width: 200}}
                                    />

                                    <Search
                                        ref={this.inputRefOfIp}
                                        placeholder="??????IP"
                                        allowClear
                                        onSearch={this.handleSearchByIp}
                                        style={{width: 200}}
                                    />

                                    <Select mode="multiple"
                                            allowClear
                                            placeholder="????????????" onChange={this.handleTagsChange}
                                            style={{minWidth: 150}}>
                                        {this.state.tags.map(tag => {
                                            if (tag === '-') {
                                                return undefined;
                                            }
                                            return (<Select.Option key={tag}>{tag}</Select.Option>)
                                        })}
                                    </Select>

                                    <Tooltip title='????????????'>

                                        <Button icon={<UndoOutlined/>} onClick={() => {
                                            this.inputRefOfName.current.setValue('');
                                            this.inputRefOfIp.current.setValue('');
                                            this.loadTableData({
                                                ...this.state.queryParams,
                                                pageIndex: 1,
                                                pageSize: 10,
                                                protocol: 'ssh',
                                                name: '',
                                                ip: ''
                                            })
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Divider type="vertical"/>

                                    <Tooltip title="????????????">
                                        <Button icon={<SyncOutlined/>} onClick={() => {
                                            this.loadTableData(this.state.queryParams)
                                        }}>

                                        </Button>
                                    </Tooltip>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table key='assets-table'
                           rowSelection={rowSelection}
                           dataSource={this.state.items}
                           columns={columns}
                           position={'both'}
                           size="middle"
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
                    />
                </Content>
            </>
        );
    }
}

export default ChooseAsset;
