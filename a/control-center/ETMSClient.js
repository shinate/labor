'use stick';

import EventEmitter from 'events'
import WSservice from './lib/WSService'
import WSAdapter from './lib/WSAdapter'
import uuid from 'uuid'
import randomatic from 'randomatic'
import CMD from './model/cmd'
import * as PROTO from './model/protocol'

function uniqueid() {
    return randomatic('Aa0', 7) + (+new Date).toString(36).substr(-3)
}

function now() {
    return +new Date
}

const LOCALHEARTBEAT_INTERVAL = 10000
const LOCALHEARTBEAT_TIMEOUT = 60000
const REQ_TIMEOUT = 30000

class ETMSClient {

    $event = new EventEmitter()
    $uuid = null
    $connection = null
    $ls = window.localStorage
    _logged = false
    _req_pool = {}
    _msg_pool = []

    constructor(config) {
        this.getUUID()
        if (window.hasOwnProperty('ETMS_INJECTOR')) {
            this.$connection = new WSAdapter()
        } else {
            this.$connection = new WSservice(config)
        }

        this.$event.on('logged', () => this.releaseMessagePool())

        this.$connection.onMessage(message => this.receiveMessageHandle(message));
        this.$connection.onConnect(() => this.login())

        this.localHeartBeatProcess()
    }

    getConnection() {

    }

    getUUID() {
        let _uuid = this.$ls.getItem('ETMSClient_UUID')
        let _sign = this.$ls.getItem('ETMSClient_SIGN')
        if (_uuid && _sign && _sign > (+new Date) - LOCALHEARTBEAT_TIMEOUT) {
            this.$uuid = _uuid
        } else {
            this.$uuid = uuid.v1()
        }
    }

    localHeartBeatProcess() {
        setInterval(() => {
            this.$ls.setItem('ETMSClient_UUID', this.$uuid)
            this.$ls.setItem('ETMSClient_SIGN', now())
        }, LOCALHEARTBEAT_INTERVAL)
    }

    login() {
        this.send(CMD.LOGIN, null, `2940\t1374\t${now()}`, (ret) => {
            this._logged = true;
            this.$event.emit('logged')
        }, () => {
            this._logged = false;
            this.$connection.close()
        })
    }

    request(content) {
        this.send(CMD.REQUEST, null, JSON.stringify(content));
    }

    control(content) {
    }

    rev(cb) {
        this.$event.on('message', cb.bind(this))
    }

    send(protocol, target, content, done, fail) {
        let sender = () => {
            let _unqid = uniqueid()
            let message = PROTO.encrypt(protocol, this.$uuid, target || null, _unqid, content)

            if (done && typeof done === 'function' || fail && typeof fail === 'function') {
                return new Promise((resolve, reject) => {
                    this._req_pool[_unqid] = {
                        done: resolve,
                        fail: reject,
                        time: now(),
                        _   : setTimeout(() => reject('TIMEOUT'), REQ_TIMEOUT)
                    }

                    this.$connection.send(message)
                })
                    .then(done, fail)
                    .finally(() => {
                        this._req_pool[_unqid] = null
                        delete this._req_pool[_unqid]
                    })
            } else {
                return this.$connection.send(message)
            }
        }

        if (this.$connection.isOnline()) {
            sender()
        } else {
            this.$connection.reconnect()
            this._msg_pool.push(sender)
        }
    }

    releaseMessagePool() {
        this._msg_pool.forEach(fn => {
            fn()
        })

        this._msg_pool = [];
    }

    receiveMessageHandle(message) {
        var message = PROTO.decrypt(message);

        switch (message.cmd) {
            case CMD.LOGIN:
                if (this._req_pool.hasOwnProperty(message.reqid)) {
                    var rep = JSON.parse(message.content);
                    if (rep.code === 0) {
                        clearTimeout(this._req_pool[message.reqid]._)
                        this._req_pool[message.reqid].done(rep.message)
                    } else {
                        this._req_pool[message.reqid].fail(rep.message)
                    }
                }
                break
            default:
                this.$event.emit('message', JSON.parse(message.content))
                break
        }

        this.$event.emit('message', message.content)
    }
}

export default ETMSClient