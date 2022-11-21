function env() {
    if (process.env.REACT_APP_ENV === 'development') {
        // 本地开发环境
        return {
            // server: '//192.168.28.188:8077/',
            // wsServer: 'ws://192.168.28.188:8077/',
            server: '//192.168.28.179:8088/',
            // server: '//192.168.28.188:10000/',
            // wsServer: 'ws://192.168.28.188:10000',
            wsServer: 'ws://192.168.28.179:8088',
            prefix: '',
        }
    } else {
        // 生产环境
        let wsPrefix;
        if (window.location.protocol === 'https:') {
            wsPrefix = 'wss:'
        } else {
            wsPrefix = 'ws:'
        }
        return {
            server: '',
            wsServer: wsPrefix + window.location.host,
            prefix: window.location.protocol + '//' + window.location.host,
        }
    }
}
export default env();

export const server = env().server;
export const wsServer = env().wsServer;
export const prefix = env().prefix;
