"use strict"

import EventEmitter from 'events'
import WSservice from './ws/service'
import WSAdapter from './ws/adapter'
import uuid from 'uuid'
import CMD from './model/cmd'
import * as PROTO from './model/protocol'
import * as EXCEPTION from './model/exception'
import now from './lib/now'
import noop from './lib/noop'

const LOCALHEARTBEAT_INTERVAL = 10000
const LOCALHEARTBEAT_TIMEOUT = 60000
const REQ_TIMEOUT = 5000

class ETMSClient {

    $event = new EventEmitter()
    $uuid = null
    $connection = null
    $ls = window.localStorage
    $PROTO = PROTO
    _logged = false
    _req_pool = {}
    _msg_pool = []
    config = {}

    constructor(config) {
        Object.assign(this.config, config || {})
        this.getUUID()
        this.getConnection()
        this.on('logged', () => this.releaseMessagePool())

        this.$connection.onMessage(message => this._rev(message));
        this.$connection.onConnect(() => this.login())
        this.$connection.onDisconnect(() => this.$event.emit('disconnected'))

        this.localHeartBeatProcess()

        console.log(this)
    }

    getConnection() {
        if (window.hasOwnProperty('ETMS_INJECTOR')) {
            this.$connection = new WSAdapter()
        } else {
            this.$connection = new WSservice(this.config)
        }
    }

    getUUID() {
        let _uuid = this.$ls.getItem('ETMSClient_UUID')
        let _sign = this.$ls.getItem('ETMSClient_SIGN')
        if (_uuid && _sign && _sign > now() - LOCALHEARTBEAT_TIMEOUT) {
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
        let _r = this.send(CMD.LOGIN, null, this.config.token, (e) => {
            this._logged = true;
            this.emit('logged', e)
        }, (e) => {
            this._logged = false;
            this.$connection.close()
            this.emit('loginFailed', e)
        })
        this.emit('login', _r)
        return _r;
    }

    logout() {
        this._logged = false;
    }

    request(content, done, fail) {
        return this.send(CMD.REQUEST, null, content, done, fail)
    }

    control(target, content) {
    }

    rev(cb) {
        this.on('message', cb)
    }

    on(...args) {
        this.$event.on.apply(this, args)
    }

    emit(...args) {
        this.$event.emit.apply(this, args)
    }

    _rev(message) {
        let {cmd, source, target, status, unqid, reqid, content} = this.$PROTO.unpack(this.$PROTO.decrypt(message))

        if (target !== this.$uuid) {
            return false
        }

        switch (cmd) {
            case CMD.LOGIN:
                status = 0
                content = '登录成功'
            case CMD.REQUEST:
                // any more
                if (this._req_pool.hasOwnProperty(reqid)) {
                    if (status === 0) {
                        this._req_pool[reqid].resolve(content)
                    } else {
                        this._req_pool[reqid].reject(content || EXCEPTION.CODE(status))
                    }
                }
                break
            default:
                this.emit('message', content)
                break
        }

        console.log({cmd, source, target, status, unqid, reqid, content})
    }

    _send(structure) {
        console.log(structure)

        if (this.$connection.isOnline() && (structure.cmd === CMD.LOGIN || this._logged)) {
            this.$connection.send(this.$PROTO.encrypt(structure))
            return structure
        }

        return false

        // let message = this.$PROTO.encrypt(structure)
        //
        // if (this.$connection.isOnline() && (structure.cmd === CMD.LOGIN || this._logged)) {
        //     this.$connection.send(message)
        // } else {
        //     this.pushMessagePool(message)
        //     this.$connection.reconnect()
        // }
        //
        // return structure
    }

    send(cmd, target, content, done, fail) {

        let structure = this.$PROTO.pack(cmd, this.$uuid, target || null, content)
        let _unqid = structure.unqid

        if (done && typeof done === 'function') {
            if (typeof fail !== 'function') {
                fail = noop;
            }

            let stopTimeoutLsn = () => {
                clearTimeout(this._req_pool[_unqid]._)
                this._req_pool[_unqid]._ = null
            }

            let clear = () => {
                this._req_pool[_unqid] = null
                delete this._req_pool[_unqid]
            }

            let resolve = (m) => {
                stopTimeoutLsn()
                done(m)
                clear();
            }

            let reject = (m) => {
                stopTimeoutLsn()
                fail(m)
                clear();
            }

            this._req_pool[_unqid] = {
                resolve,
                reject,
                time: now(),
                _   : setTimeout(() => reject(EXCEPTION.TIMEOUT), REQ_TIMEOUT)
            }
        }

        return this._send(structure)
    }

    pushMessagePool(message) {
        this._msg_pool.push(message)
    }

    releaseMessagePool() {
        this._msg_pool.forEach(message => {
            this.$connection.send(message)
        })

        this._msg_pool = []
    }
}

export default ETMSClient