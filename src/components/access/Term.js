import React, {Component} from 'react';
import "xterm/css/xterm.css"
import {Terminal} from "xterm";
import qs from "qs";
import {wsServer} from "../../common/env";
import {exitFull, getToken, isEmpty, requestFullScreen} from "../../utils/utils";
import {FitAddon} from 'xterm-addon-fit';
import "./Access.css"
import request from "../../common/request";
import {Affix, Button, Drawer, message, Modal, Spin} from "antd";
import {FolderOutlined, ExclamationCircleOutlined, LineChartOutlined, ExpandOutlined} from "@ant-design/icons";
import Draggable from "react-draggable";
import FileSystem from "./FileSystem";
import Message from "./Message";
import Stats from "./Stats";

class Term extends Component {

    statsRef = undefined;

    state = {
        width: window.innerWidth,
        height: window.innerHeight,
        term: undefined,
        webSocket: undefined,
        fitAddon: undefined,
        sessionId: undefined,
        session: {},
        enterBtnIndex: 1001,
        modalVisible:false,
        fullScreen: false,
        fullScreenBtnText: '进入全屏',
    };

    componentDidMount = async () => {

        let urlParams = new URLSearchParams(this.props.location.search);
        let assetId = urlParams.get('assetId');
        document.title = urlParams.get('assetName');

        let session = await this.createSession(assetId);
        if (!session) {
            return;
        }
        let sessionId = session['id'];
        if (isEmpty(sessionId)) {
            return;
        }

        let term = new Terminal({
            fontFamily: 'monaco, Consolas, "Lucida Console", monospace',
            fontSize: 15,
            //here
            // theme: {
            //     background: '#1b1b1b',
            //     lineHeight: 17
            // },
            rightClickSelectsWord: true,
        });
        term.open(this.refs.terminal);
        //FitAddon插件，调整终端大小以适合父元素的大小
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        fitAddon.fit();
        term.focus();

        term.writeln('Trying to connect to the server ...');

        term.onSelectionChange(async () => {
            let selection = term.getSelection();
            this.setState({
                selection: selection
            })
            if (navigator.clipboard) {
                //Clipboard.writeText()方法用于将文本内容写入剪贴板
                await navigator.clipboard.writeText(selection);
            }
        });

        term.attachCustomKeyEventHandler((e) => {
            if (e.ctrlKey && e.key === 'c' && this.state.selection) {
                return false;
            }
            return !(e.ctrlKey && e.key === 'v');
        });


        term.onData(data => {
            let webSocket = this.state.webSocket;
            if (webSocket !== undefined) {
                webSocket.send(new Message(Message.Data, data).toString());

            }
        });

        let token = getToken();
        let params = {
            'cols': term.cols,
            'rows': term.rows,
            'sessionId': sessionId,
            'X-Auth-Token': token
        };

        let paramStr = qs.stringify(params);

        let webSocket = new WebSocket(wsServer + '/ssh?' + paramStr);

        let pingInterval;
        webSocket.onopen = (e => {
            pingInterval = setInterval(() => {
                webSocket.send(new Message(Message.Ping, "").toString());
            }, 5000);
        });

        webSocket.onerror = (e) => {
            term.writeln("Failed to connect to server.");
        }
        webSocket.onclose = (e) => {
            term.writeln("Connection is closed.");
            if (pingInterval) {
                clearInterval(pingInterval);
            }
            Modal.success({
                content: '本次会话连接已关闭',
                okText: '确认',
            });
        }

        webSocket.onmessage = (e) => {
            let msg = Message.parse(e.data);
            switch (msg['type']) {
                case Message.Connected:
                    term.clear();
                    this.updateSessionStatus(sessionId);
                    break;
                case Message.Data:
                    term.write(msg['content']);
                    break;
                case Message.Closed:
                    term.writeln(`\x1B[1;3;31m${msg['content']}\x1B[0m `)
                    webSocket.close();
                    break;
                case Message.CommandBreak:
                    Modal.info({
                        content: msg['content'],
                        okText: '确认',
                    });
                    this.setState({modalVisible:false})
                    break;
                case Message.CommandOrdering:
                    this.setState({modalVisible:true})
                    break;
                case Message.CommodOk:
                    this.setState({modalVisible:false})
                    message.success('审批通过');
                    break;
                case Message.OutTime:
                    this.setState({modalVisible:false})
                    Modal.error({
                        content: '申请超时',
                        okText: '确认',
                    });
                    break;
                case Message.Concel:
                    this.setState({modalVisible:false})
                    break;
                default:
                    break;
            }
        }

        this.setState({
            term: term,
            webSocket: webSocket,
            fitAddon: fitAddon,
            sessionId: sessionId,
            session: session
        });

        window.addEventListener('resize', this.onWindowResize);
        //here
    }

    componentWillUnmount() {
        let webSocket = this.state.webSocket;
        if (webSocket) {
            webSocket.close()
        }
    }
    //here
    showMessage(msg) {
        message.destroy();
        Modal.confirm({
            title: '提示',
            icon: <ExclamationCircleOutlined/>,
            content: msg,
            centered: true,
            okText: '重新连接',
            cancelText: '关闭页面',
            onOk() {
                window.location.reload();
            },
            onCancel() {
                window.close();
            },
        });
    }

    async createSession(assetsId) {
        let result = await request.post(`/sessions?assetId=${assetsId}&mode=naive`);
        if (result['code'] !== 1) {
            this.showMessage(result['message']);
            return null;
        }
        return result['data'];
    }

    updateSessionStatus = async (sessionId) => {
        let result = await request.post(`/sessions/${sessionId}/connect`);
        if (result['code'] !== 1) {
            message.error(result['message']);
        }
    }

    terminalSize() {
        return {
            cols: Math.floor(this.state.width / 7.5),
            rows: Math.floor(window.innerHeight / 17),
        }
    }

    onWindowResize = (e) => {
        let term = this.state.term;
        let fitAddon = this.state.fitAddon;
        let webSocket = this.state.webSocket;

        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        }, () => {
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                fitAddon.fit();
                term.focus();
                let terminalSize = {
                    cols: term.cols,
                    rows: term.rows
                }
                webSocket.send(new Message(Message.Resize, window.btoa(JSON.stringify(terminalSize))).toString());
            }
        });
    };

    focus = () => {
        let term = this.state.term;
        if (term) {
            term.focus();
        }
    }

    onRef = (statsRef) => {
        this.statsRef = statsRef;
    }

    fullScreen = () => {
        let fs = this.state.fullScreen;
        if (fs) {
            exitFull();
            this.setState({
                fullScreen: false,
                fullScreenBtnText: '进入全屏'
            })
        } else {
            requestFullScreen(document.documentElement);
            this.setState({
                fullScreen: true,
                fullScreenBtnText: '退出全屏'
            })
        }
    }

    render() {
        return (
            <div>
                <div ref='terminal' id='terminal' style={{
                    height: this.state.height,
                    width: this.state.width,
                    backgroundColor: 'black',
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                }}/>

                <Draggable>
                    <Affix style={{position: 'absolute', top: 50, right: 100, zIndex: this.state.enterBtnIndex}}>
                        <Button icon={<ExpandOutlined/>} onClick={()=>{this.fullScreen()}}/>
                    </Affix>
                </Draggable>

                <Draggable>
                    <Affix style={{position: 'absolute', top: 50, right: 50, zIndex: this.state.enterBtnIndex}}>
                        <Button icon={<FolderOutlined/>} onClick={() => {
                            this.setState({
                                fileSystemVisible: true,
                                enterBtnIndex: 999, // xterm.js 输入框的zIndex是1000，在弹出文件管理页面后要隐藏此按钮
                            });
                        }}/>
                    </Affix>
                </Draggable>

                <Draggable>
                    <Affix style={{position: 'absolute', top: 100, right: 50, zIndex: this.state.enterBtnIndex}}>
                        <Button icon={<LineChartOutlined/>} onClick={() => {
                            this.setState({
                                statsVisible: true,
                                enterBtnIndex: 999, // xterm.js 输入框的zIndex是1000，在弹出文件管理页面后要隐藏此按钮
                            });
                            if (this.statsRef) {
                                this.statsRef.addInterval();
                            }
                        }}/>
                    </Affix>
                </Draggable>

                <Drawer
                    title={'会话详情'}
                    placement="right"
                    width={window.innerWidth * 0.8}
                    closable={true}
                    // maskClosable={false}
                    onClose={() => {
                        this.setState({
                            fileSystemVisible: false,
                            enterBtnIndex: 1001, // xterm.js 输入框的zIndex是1000，在隐藏文件管理页面后要显示此按钮
                        });
                        this.focus();
                    }}
                    visible={this.state.fileSystemVisible}
                >
                    <FileSystem
                        storageId={this.state.sessionId}
                        storageType={'sessions'}
                        upload={this.state.session['upload'] === '1'}
                        download={this.state.session['download'] === '1'}
                        delete={this.state.session['delete'] === '1'}
                        rename={this.state.session['rename'] === '1'}
                        edit={this.state.session['edit'] === '1'}
                        minHeight={window.innerHeight - 103}/>
                </Drawer>

                <Drawer
                    title={'状态信息'}
                    placement="right"
                    width={window.innerWidth * 0.8}
                    closable={true}
                    onClose={() => {
                        this.setState({
                            statsVisible: false,
                            enterBtnIndex: 1001, // xterm.js 输入框的zIndex是1000，在隐藏文件管理页面后要显示此按钮
                        });
                        this.focus();
                        if (this.statsRef) {
                            this.statsRef.delInterval();
                        }
                    }}
                    visible={this.state.statsVisible}
                >
                    <Stats sessionId={this.state.sessionId} onRef={this.onRef}/>
                </Drawer>

                {
                    this.state.modalVisible ?
                        <Modal visible={this.state.modalVisible}
                               footer={null}
                               onCancel={async ()=>{
                                   this.setState({
                                       modalVisible: false
                                   });
                                   let result = await request.put('/workorder/cancel');
                                   if (result['code'] === 1) {
                                       message.success("取消申请"+result['message']);
                                   } else {
                                       message.error("取消申请"+result['message']);
                                   }
                               }}>
                            <Spin tip="命令审批中..."/>
                        </Modal> : undefined
                }
            </div>
        );
    }
}

export default Term;
