"use strict"

import EventEmitter from 'events'
import service from './service'
import adapter from './adapter'
import uuid from 'uuid'
import CMD from './model/cmd'
import * as PROTO from './model/protocol'
import * as EXCEPTION from './model/exception'
import now from './lib/now'
import noop from './lib/noop'

const LOCAL_KEEPALIVE_INTERVAL = 10000
const LOCAL_KEEPALIVE_TIMEOUT = 60000
const REQUEST_TIMEOUT = 5000

class ETMSClient extends EventEmitter {

    _uuid = null

    $connection = null

    $store = window.localStorage

    $proto = PROTO

    _logged = false

    _req_pool = {}

    _msg_pool = []

    _config = {
        LOCAL_KEEPALIVE_INTERVAL,
        LOCAL_KEEPALIVE_TIMEOUT,
        REQUEST_TIMEOUT
    }

    constructor(config) {
        super()
        this._config = {...this._config, ...config}
        this.init()

        this.$connection.onMessage(message => this.receive(message));
        this.$connection.onOpen(() => {
            this.login()
            this.emit('connect')
        })
        this.$connection.onClose(() => {
            this.emit('disconnect')
            this._logged = false
        })

        this.on('logged', () => this.releaseMessagePool())

        this.localHeartBeatProcess()

        console.log(this)
    }

    init() {
        if (window.hasOwnProperty('ETMS_INJECTOR')) {
            this.$connection = new adapter()
        } else {
            let {url, protocol} = this._config
            this.$connection = new service(url, protocol)
        }

        let _uuid = this.$store.getItem('ETMSClient_UUID')
        let _sign = this.$store.getItem('ETMSClient_SIGN')
        if (_uuid && _sign && _sign > now() - this._config.LOCAL_KEEPALIVE_TIMEOUT) {
            this._uuid = _uuid
        } else {
            this._uuid = uuid.v1()
        }
    }

    localHeartBeatProcess() {
        setInterval(() => {
            this.$store.setItem('ETMSClient_UUID', this._uuid)
            this.$store.setItem('ETMSClient_SIGN', now())
        }, this._config.LOCAL_KEEPALIVE_INTERVAL)
    }

    login() {
        let req = this.send(CMD.LOGIN, null, this._config.token, (e) => {
            this._logged = true;
            this.emit('login:done', e)
        }, (e) => {
            this._logged = false;
            this.$connection.close()
            this.emit('login:fail', e)
        })
        this.emit('login', req)
        return req;
    }

    logout() {
        this._logged = false;
    }

    request(content, done, fail) {
        return this.send(CMD.REQUEST, null, content, done, fail)
    }

    control(target, content) {
        return this.send(CMD.REQUEST, target, content)
    }

    receive(message) {
        let {cmd, source, target, status, unqid, reqid, content} = this.$proto.unpack(this.$proto.decrypt(message))

        // 回源身份识别
        // if (target !== this.$uuid) {
        //     return false
        // }

        switch (cmd) {
            case CMD.LOGIN:
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

    send(cmd, target, content, done = null, fail = null) {

        let structure = this.$proto.pack(cmd, this._uuid, target || null, content)
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
                _   : setTimeout(() => reject(EXCEPTION.TIMEOUT), this._config.REQUEST_TIMEOUT)
            }
        }

        if (this.$connection.isOnline() && (structure.cmd === CMD.LOGIN || this._logged)) {
            this.$connection.send(this.$proto.encrypt(structure))
            return structure
        }

        return false
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