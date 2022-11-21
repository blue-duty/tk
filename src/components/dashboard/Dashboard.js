import React, {Component} from 'react';
import {Card, Col, Row} from "antd";
import {DatabaseOutlined, ApiOutlined, FileTextOutlined, UserOutlined} from '@ant-design/icons';
import request from "../../common/request";
import './Dashboard.css'
import {Link} from "react-router-dom";
import {Area} from '@ant-design/charts';
import {isAdmin} from "../../service/permission";

class Dashboard extends Component {

    state = {
        counter: {},
        weekUsers: {},
        weekAssets: {},
        recentLogin: {},
        OperaviewNum:[]
    }

    componentDidMount() {
        this.getCounter();
        this.getWeekUsers();
        this.getWeekAssets();
        this.getRecentLogin();
        this.getOperaviewNum()
    }

    componentWillUnmount() {

    }

    getCounter = async () => {
        let result = await request.get('/overview/counter');
        if (result['code'] === 1) {
            this.setState({
                counter: result['data']
            })
        }
    }

    getWeekUsers = async () => {
        let result = await request.get('/overview/week-users-top');
        if (result['code'] === 1) {
            this.setState({
                weekUsers: result['data']
            })
        }
    }

    getWeekAssets = async () => {
        let result = await request.get('/overview/week-assets-top');
        if (result['code'] === 1) {
            this.setState({
                weekAssets: result['data']
            })
        }
    }

    getRecentLogin = async () => {
        let result = await request.get('/overview/recent-login');
        if (result['code'] === 1) {
            this.setState({
                recentLogin: result['data']
            })
        }
    }

    getOperaviewNum = async () => {
        let result = await request.get('/overview/week-agreement');
        if (result['code'] === 1) {
            this.setState({
                OperaviewNum: result['data']
            })
        }
    }

    handleLinkClick = (e) => {
        if (!isAdmin()) {
            e.preventDefault();
        }
    }

    render() {

        const data = (values) => {
            const res = [];
            values.forEach((item,index)=>{
                for(const [key,value] of Object.entries(item)){
                    if(key==="Daytime"){
                    }else {
                        if (key==="Application"){
                            res.push({"day":item['Daytime'],"count":Number(value),"protocol":"应用"})
                        }else{
                            res.push({"day":item['Daytime'],"count":Number(value),"protocol":key})
                        }

                    }
                }
            })
            return res
        }

        const config = {
            height:300,
            data: data(this.state.OperaviewNum) ,
            xField: 'day',
            yField: 'count',
            seriesField: 'protocol',
            legend:{
                position:'bottom'
            },
            smooth:true,
            xAxis: {
                range: [0, 1],
            }
        };

        const backgroundColor =['#00afaf','#1d74b2','#4169E1','seagreen','#ccc']
        const usersdiv = (values) => {
            const res = [];
            for(let i = 0; i < 10; i++) {
                res.push(
                    <div className="box" key={i}>
                        <div className="box_left">
                            <span className="num" style={ {backgroundColor:backgroundColor[i] ? backgroundColor[i]:'#ccc' } }>{values[i]? i+1 :''}</span>
                            <span>{values[i]? values[i]['username'] :''}</span>
                        </div>
                        <div className="box_right">{values[i]? values[i]['loginNumbers']+'次/周' :''}</div>
                    </div>
                )
            }
            return res
        }

        const assetsdiv = (values) => {
            const res = [];
            for(let i = 0; i < 10; i++) {
                res.push(
                    <div className="box" key={i}>
                        <div className="box_left">
                            <span className="num" style={ {backgroundColor:backgroundColor[i] ? backgroundColor[i]:'#ccc' } }>{ values[i]? i+1 :''}</span>
                            <span>{values[i]? values[i]['name'] :''}</span>
                        </div>
                        <div className="box_right">{values[i]? values[i]['operateNumbers']+'次/周' :''}</div>
                    </div>
                )
            }
            return res
        }

        const recentdiv = (values) => {
            const res = [];
            for(let i = 0; i < 10; i++) {
                res.push(
                    <div className="box" key={i}>
                        <div className="box_left">
                            <span className="num" style={ {backgroundColor:backgroundColor[i] ? backgroundColor[i]:'#ccc' } }>{ values[i]? i+1 :''}</span>
                            <span>{values[i]? values[i]['user'] :''}</span>
                        </div>
                        <div className="box_right">{values[i]? values[i]['loginNumbers']+'次/周' :''}</div>
                    </div>
                )
            }
            return res
        }

        return (
            <>

                <div style={{margin: '6px 12px'}}>
                    <Row gutter={{
                        xs: 8,
                        sm: 16,
                        md: 24,
                        lg: 32,
                    }}>
                        <Col span={6} className="gutter-row">
                            <Card bordered={true} className="card-1">
                                <Link to={'/user'} onClick={this.handleLinkClick}>
                                    <div className="total">
                                        <div className="left">
                                            <i className="icon"><UserOutlined/></i>
                                        </div>
                                        <div className="right">
                                            <div className='right-1'>{this.state.counter['user']}</div>
                                            <div className="right-2">用户</div>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        </Col>
                        <Col span={6} className="gutter-row">
                            <Card bordered={true} className="card-2">
                                <Link to={'/asset'}>
                                    <div className="total">
                                        <div className="left">
                                            <i className="icon"><DatabaseOutlined/></i>
                                        </div>
                                        <div className="right">
                                            <div className='right-1'>{this.state.counter['asset']}</div>
                                            <div className="right-2">主机</div>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        </Col>
                        <Col span={6} className="gutter-row">
                            <Card bordered={true} className="card-3">
                                <Link to={'/app'}>
                                    <div className="total">
                                        <div className="left">
                                            <i className="icon"><ApiOutlined/></i>
                                        </div>
                                        <div className="right">
                                            <div className='right-1'>{this.state.counter['application']}</div>
                                            <div className="right-2">应用</div>
                                        </div>
                                    </div>
                                </Link>

                            </Card>
                        </Col>
                        <Col span={6} className="gutter-row">
                            <Card bordered={true} className="card-4">
                                <Link to={'/approval-work-order'} onClick={this.handleLinkClick}>
                                    <div className="total">
                                        <div className="left">
                                            <i className="icon"><FileTextOutlined /></i>
                                        </div>
                                        <div className="right">
                                            <div className='right-1'>{this.state.counter['workOrder']}</div>
                                            <div className="right-2">工单</div>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <div style={{margin: '8px 12px'}}>
                    <Row gutter={{
                        xs: 8,
                        sm: 16,
                        md: 24,
                        lg: 32,
                    }}>
                        <Col span={8}>
                            <Card title="周用户 TOP10" className="card-box">
                                { usersdiv(this.state.weekUsers) }
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card title="最近10次登录" className="card-box">
                                { recentdiv(this.state.recentLogin) }
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card title="周资产 TOP10" className="card-box">
                                { assetsdiv(this.state.weekAssets) }
                            </Card>
                        </Col>
                    </Row>
                </div>

                <div style={{margin: '0 12px'}}>
                    <Row gutter={{
                        xs: 8,
                        sm: 16,
                        md: 24,
                        lg: 32,
                    }}>
                        <Col span={24}>
                            <Card title="最近一周运维次数" bordered={true}>
                                <Area {...config} />
                            </Card>
                        </Col>
                    </Row>
                </div>
            </>
        );
    }
}

export default Dashboard;
