import React, {Component} from 'react';
import 'antd/dist/antd.css';
import './App.css';
import headerlogo from "./header_logo.png"
import avatar from "./avatar.jpg"
import {Col, Layout, Menu, Popconfirm, Row, Badge,Modal,Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, BellOutlined } from '@ant-design/icons';
import * as Icon from '@ant-design/icons';
import {Link, Route, Switch} from "react-router-dom";
import request from "./common/request";
import {message} from "antd/es";
import {isEmpty, NT_PACKAGE} from "./utils/utils";
import {getCurrentUser} from "./service/permission";
import Dashboard from "./components/dashboard/Dashboard";
import Asset from "./components/asset/Asset";
import Access from "./components/access/Access";
import AppAccess from "./components/access/AppAccess";
import User from "./components/user/User";
import SessionAudit from "./components/session/SessionAudit";
import Login from "./components/Login";
import DynamicCommand from "./components/command/DynamicCommand";
import Credential from "./components/asset/Credential";
import Info from "./components/user/Info";
import BatchCommand from "./components/command/BatchCommand";
import UserGroup from "./components/user/UserGroup";
import LoginLog from "./components/audit/LoginLog";
import OperationLog from "./components/audit/OperationLog";
import Term from "./components/access/Term";
import Job from "./components/devops/Job";
import Security from "./components/tactics/Security";
import SystemState from "./components/tactics/SystemState";
import PasswordSet from "./components/tactics/PasswordSet";
import Storage from "./components/user/Storage";
import SecretStrategy from "./components/devops/SecretStrategy";
import ApprovalOrder from "./components/workorder/ApprovalOrder";
import ApprovalRecord from "./components/audit/ApprovalRecord";
import CommandControl from "./components/tactics/CommandControl";
import StationMessage from "./components/audit/StationMessage";
import SystemConfig from "./components/setting/SystemConfig";
import NetworkConfig from "./components/setting/NetworkConfig";
import HostConfig from "./components/setting/HostConfig";
import Authentication from "./components/setting/Authentication";
import HostMaintain from "./components/setting/HostMaintain";
import Application from './components/asset/Application';
import ApplicSer from './components/asset/ApplicSer';
import WorkOrderApply from "./components/workorder/WorkOrderApply";
import WorkOrderApprove from "./components/workorder/WorkOrderApprove";
import AuditBackup from "./components/audit/AuditBackup";
import LoginReport from "./components/reports/LoginReport";
import TerminalReport from "./components/reports/TerminalReport";
import OperationReport from "./components/reports/OperationReport";
import AssetGroup from "./components/asset/AssetGroup";

const {Header, Sider, Content} = Layout;

const {SubMenu} = Menu;
const headerHeight = 55;

class App extends Component {

    state = {
        collapsed: false,
        current: sessionStorage.getItem('current'),
        openKeys: sessionStorage.getItem('openKeys') ? JSON.parse(sessionStorage.getItem('openKeys')) : [],
        user: {
            'nickname': '未定义'
        },
        package: NT_PACKAGE(),
        triggerMenu: true,
        menuList: [],
        mesReadData:[],
        mesCount:0,
        mesVisible:false
    };

    onCollapse = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    componentDidMount() {
        let hash = window.location.hash;
        let current = hash.replace('#/', '');
        if (isEmpty(current)) {
            current = 'dashboard';
        }
        this.setCurrent(current);
        this.getInfo();
        this.getMenuList();
        this.getMessage()
    }

    async getMessage() {
        let result = await request.get('/message/read');
        if (result['code'] === 1) {
            result.data = result['data'] ? result['data'] :[]
            this.setState({
                mesReadData: result.data ,
                mesCount: result.data.length
            })
        } else {
            message.error(result['message']);
        }
    }

    async getMenuList() {
        let result = await request.get('/user-group-menus');
        if (result['code'] === 1) {
            this.setState({
                menuList: result['data']
            })
            sessionStorage.setItem('menuList', JSON.stringify(result['data']));
        } else {
            message.error(result['message']);
        }
    }

    getMenuNodes = (menuList) => {
        return menuList.map(item => {
            //React.createElement创建节点
            const icon = item.icon ? React.createElement(Icon[item.icon]) :null
            if (!item.child) {
                return (
                    <Menu.Item key={item.key} icon={icon}>
                        <Link to={item.path}>
                            <span>{item.title}</span>
                        </Link>
                    </Menu.Item>
                );
            }  else {
                return (
                    <SubMenu key={item.key} icon={icon}
                             title={<span>{item.title}</span>}
                    >
                        {
                            this.getMenuNodes(item.child)
                        }
                    </SubMenu>);
            }
        });
    };

    async getInfo() {

        let result = await request.get('/info');
        if (result['code'] === 1) {
            sessionStorage.setItem('user', JSON.stringify(result['data']));
            this.setState({
                user: result['data'],
                triggerMenu: true
            })
        } else {
            message.error(result['message']);
        }
    }

    updateUser = (user) => {
        this.setState({
            user: user
        })
    }

    setCurrent = (key) => {
        this.setState({
            current: key
        })
        sessionStorage.setItem('current', key);
    }

    subMenuChange = (openKeys) => {
        this.setState({
            openKeys: openKeys
        })
        sessionStorage.setItem('openKeys', JSON.stringify(openKeys));
    }

    confirm = async (e) => {
        let result = await request.post('/logout');
        if (result['code'] !== 1) {
            message.error(result['message']);
        } else {
            message.success('退出登录成功，即将跳转至登录页面。');
            window.location.reload();
        }
    }

    render() {
        const mesUnRead = (values) => {
            const res = [];
            for(let i = 0; i < values.length; i++) {
                res.push(
                    <p key={i}>{values[i]['created']}：{values[i].content}</p>
                )
            }
            return res
        }

        return (

            <Switch>
                <Route path="/access" component={Access}/>
                <Route path="/term" component={Term}/>
                <Route path="/appaccess" component={AppAccess}/>
                <Route path="/login"><Login updateUser={this.updateUser}/></Route>

                <Route path="/">
                    <Layout className="layout" style={{minHeight: '100vh'}}>

                        <Header className="site-layout-background"
                                style={{padding: 0, height: headerHeight, zIndex: 20, lineHeight:0 }}>
                            <div className='layout-header'>
                                <Row justify="space-around" align="middle" gutter={{ xs: 8, sm: 16, md: 24}} style={{height: headerHeight}}>
                                    <Col span={4} key={1} style={{height: headerHeight}}>
                                        <div className="logo">
                                            <img src={ headerlogo } alt='logo'/>
                                        </div>
                                    </Col>
                                    <Col span={20} key={2} style={{textAlign: 'right'}}
                                         className={'layout-header-right'}>
                                        <div className='nickname layout-header-right-item'>
                                            <Badge className="badge" size="small"
                                                   count={this.state.mesCount}
                                                   onClick={()=>{this.setState({mesVisible:true})}}
                                            >
                                                <BellOutlined />
                                            </Badge>
                                            <img className="avatar" src={ avatar } alt=""/>
                                            <span className="box1-1">
                                                <Link to={'/info'}>
                                                    {getCurrentUser()['username']}
                                                </Link>
                                            </span>
                                            <span className="box1-2">{getCurrentUser()['type']}</span>
                                            <Popconfirm
                                                key='login-btn-pop'
                                                title="您确定要退出登录吗?"
                                                onConfirm={this.confirm}
                                                okText="确定"
                                                cancelText="取消"
                                                placement="left"
                                            >
                                                <span className="loginpop">退出</span>
                                            </Popconfirm>
                                        </div>

                                        <Modal title={`${this.state.mesCount}条通知`}
                                               visible={this.state.mesVisible}
                                               className="mesCount"
                                               width={500}
                                               style={{
                                                   top:60,
                                                   left: 400,
                                                   paddingBottom:0
                                               }}
                                               footer={null}
                                               onCancel={()=>{
                                                   this.setState({mesVisible:false})
                                               }}
                                        >
                                            <div style={{height: 430,overflow:'auto'}}>
                                                {mesUnRead(this.state.mesReadData)}
                                            </div>

                                            <Link to={'/message'}>
                                                <Button type="text"
                                                        style={{width:'100%'}}
                                                        onClick={()=>{this.setState({mesVisible:false})}}
                                                >所有消息</Button>
                                            </Link>
                                        </Modal>

                                    </Col>
                                </Row>

                            </div>
                        </Header>


                        <Layout className="site-layout">
                            <Sider collapsible collapsed={this.state.collapsed} trigger={null} width='160px'>

                                <div>
                                    {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                        className: 'trigger',
                                        onClick: this.onCollapse,
                                    })}
                                </div>


                                <Menu
                                    onClick={(e) => this.setCurrent(e.key)}
                                    selectedKeys={[this.state.current]}
                                    onOpenChange={this.subMenuChange}
                                    defaultOpenKeys={this.state.openKeys}
                                    theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}
                                >
                                    {
                                        this.getMenuNodes(this.state.menuList)
                                    }
                                </Menu>
                            </Sider>
                            <Layout>
                                <Content>
                                    <Route path="/" exact component={Dashboard}/>
                                    <Route path="/asset" component={Asset}/>
                                    <Route path="/group" component={AssetGroup}/>
                                    <Route path="/credential" component={Credential}/>
                                    <Route path="/app" component={Application}/>
                                    <Route path="/app-server" component={ApplicSer}/>
                                    <Route path="/user" component={User}/>
                                    <Route path="/user-group" component={UserGroup}/>
                                    <Route path="/disk-space" component={Storage}/>
                                    <Route path="/job" component={Job}/>
                                    <Route path="/secret-strategy" component={SecretStrategy}/>
                                    <Route path="/dynamic-command" component={DynamicCommand}/>
                                    <Route path="/access-security" component={Security}/>
                                    <Route path="/command-control" component={CommandControl}/>
                                    <Route path="/password-set" component={PasswordSet}/>
                                    <Route path="/system-state" component={SystemState}/>
                                    <Route path="/approval-order" component={ApprovalOrder}/>
                                    <Route path="/work-order-apply" component={WorkOrderApply}/>
                                    <Route path="/approval-work-order" component={WorkOrderApprove}/>
                                    <Route path="/session-audit" component={SessionAudit}/>
                                    <Route path="/login-log" component={LoginLog}/>
                                    <Route path="/operation-log" component={OperationLog}/>
                                    <Route path="/approval-record" component={ApprovalRecord}/>
                                    <Route path="/message" component={StationMessage}/>
                                    <Route path="/login-report" component={LoginReport}/>
                                    <Route path="/operation-report" component={OperationReport}/>
                                    <Route path="/regular-report" component={TerminalReport}/>
                                    <Route path="/system-config" component={SystemConfig}/>
                                    <Route path="/network-config" component={NetworkConfig}/>
                                    <Route path="/host-config" component={HostConfig}/>
                                    <Route path="/authentication" component={Authentication}/>
                                    <Route path="/host-maintain" component={HostMaintain}/>
                                    <Route path="/info" component={Info}/>
                                    <Route path="/batch-command" component={BatchCommand}/>
                                    <Route path="/audit-backup" component={AuditBackup}/>
                                </Content>
                            </Layout>
                        </Layout>
                    </Layout>
                </Route>
            </Switch>

        );
    }
}

export default App;
