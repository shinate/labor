import Vue from 'vue'
import client from './client'
// import './view/commonComponents'
import './view/commonComponentsImports'
import frontendRoot from './__resources/source/frontendRoot'
import * as cinema_list from './__resources/model/cinema_list'

import CinemaList from './view/component/panel/CinemaList/CinemaList'

window.frontendRoot = frontendRoot

let ADP = new client({
    url  : "ws://123.57.43.13:20002/cmc_socket",
    token: `2940\t1374\t${+new Date}`
})

ADP.on('login', function (d) {
    pool(`${time()} LOI 登录`)
})

ADP.on('login:done', function (data) {
    pool(`${time()} LOI ${data}`)
})

ADP.on('login:fail', function (data) {
    pool(`${time()} LOI ${data}`)
})

ADP.on('disconnected', function (e) {
    pool('断开连接')
})

ADP.on('message', commandRoute)

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

new Vue({
    el: '#bar'
})

Object.assign(frontendRoot.TMS, cinema_list.response)

new Vue({
    el        : '#MAIN',
    data      : frontendRoot,
    components: {CinemaList}
})

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
        let repEmu = ADP.$proto.emulator(req.cmd, 'cmc', req.source, req.unqid, ret.status, ret.content)
        ADP.receive(repEmu)
    }
}, false)

document.querySelector('#cinema_list').addEventListener('click', function (e) {
    e.preventDefault()
    let req = ADP.request(cinema_list.request, function (data) {
        pool(`${time()} REP ${JSON.stringify(data)}`)
    })
    pool(`${time()} REQ ${JSON.stringify(cinema_list.request)}`)
    if (req) {
        let repEmu = ADP.$proto.emulator(req.cmd, 'cmc', req.source, req.unqid, 0, cinema_list.response)
        ADP.receive(repEmu)
    }
}, false)