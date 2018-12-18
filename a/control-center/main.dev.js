import ETMSClient from './ETMSClient'
import * as cinema_list from './__resources/model/cinema_list'

let ADP = new ETMSClient({
    url  : "ws://123.57.43.13:20002/cmc_socket",
    token: `2940\t1374\t${+new Date}`
})

ADP.on('login', function (d) {
    pool(`${time()} LOI 登录`)
})

ADP.on('logged', function (data) {
    pool(`${time()} LOI ${data}`)
})

ADP.on('loginFailed', function (data) {
    pool(`${time()} LOI ${data}`)
})

ADP.on('disconnected', function (e) {
    pool('断开连接')
})

ADP.rev(commandRoute)

function time() {
    return `[${(new Date()).toTimeString().slice(0, 8)}]`
}

function commandRoute(data) {
    // 解析协议、内容
    pool(`${time()} ${data}`)
}

let messagePool = document.querySelector('#message');
function pool(message) {
    let p = document.createElement('p')
    p.innerText = message
    messagePool.appendChild(p)

    messagePool.scrollTop = p.offsetTop
}

document.querySelector('#send').addEventListener('click', function (e) {
    e.preventDefault()
    let m = Math.random().toString(36).substring(2)
    let req = ADP.request(m, function (data) {
        pool(`${time()} REP ${JSON.stringify(data)}`)
    }, function (msg) {
        pool(`${time()} REP ${msg}`)
    })
    pool(`${time()} REQ ${m}`)

    if (req) {
        let ret = Math.round(Math.random()) ? {status: 0, content: req.content} : {status: -1}
        let repEmu = ADP.$PROTO.emulator(req.cmd, 'cmc', req.source, req.unqid, ret.status, ret.content)
        ADP._rev(repEmu)
    }
}, false)

document.querySelector('#cinema_list').addEventListener('click', function (e) {
    e.preventDefault()
    let req = ADP.request(cinema_list.request, function (data) {
        pool(`${time()} REP ${JSON.stringify(data)}`)
    })
    pool(`${time()} REQ ${JSON.stringify(cinema_list.request)}`)
    if (req) {
        let repEmu = ADP.$PROTO.emulator(req.cmd, 'cmc', req.source, req.unqid, 0, cinema_list.response)
        ADP._rev(repEmu)
    }
}, false)