import WSservice from './lib/WSService'
import WSAdapter from './lib/WSAdapter'
import uuid from 'uuid'
import randomatic from 'randomatic'
import PROTOCOL from './lib/Protocol'
import EventEmitter from 'events'

function build(cmd, source, target, unqid, content) {
    return JSON.stringify({
        cmd,
        source,
        target,
        unqid,
        time: now(),
        content
    });
}

function parse(message) {
    return JSON.parse(message);
}

function uniqueid() {
    return randomatic('Aa0', 7) + (+new Date).toString(36).substr(-3);
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
    _logged = false
    _req_pool = {}
    _msg_pool = []

    constructor(config) {
        this.getUUID();
        if (window.hasOwnProperty('ETMS_INJECTOR')) {
            this.$connection = new WSAdapter()
        } else {
            this.$connection = new WSservice(config)
        }

        this.$event.on('logged', () => this.releaseMessagePool())
        this.$connection.onConnect(() => this.login())

        this.localHeartBeatProcess()
    }

    getConnection() {

    }

    getUUID() {
        let _uuid = window.localStorage.getItem('ETMSClient_UUID')
        let _sign = window.localStorage.getItem('ETMSClient_SIGN')
        if (_uuid && _sign && _sign > (+new Date) - LOCALHEARTBEAT_TIMEOUT) {
            this.$uuid = _uuid
        } else {
            this.$uuid = uuid.v1()
        }
    }

    localHeartBeatProcess() {
        setInterval(() => {
            window.localStorage.setItem('ETMSClient_UUID', this.$uuid)
            window.localStorage.setItem('ETMSClient_SIGN', now())
        }, LOCALHEARTBEAT_INTERVAL)
    }

    login() {
        this.send(PROTOCOL.LOGIN, null, `2940\t1374\t${now()}`, () => {
            this._logged = true;
            this.$event.emit('logged')
        }, () => {
            this._logged = false;
            this.$connection.close()
        })
    }

    request(content) {

    }

    control(content) {

    }

    rev(cb) {
        this.$connection.onMessage(message => {
            cb(message)
        })
    }

    send(protocol, target, content, done, fail) {
        let sender = () => {
            let _unqid = uniqueid()
            let message = build(protocol, this.$uuid, target || null, _unqid, content)

            if (done && typeof done === 'function' || fail && typeof fail === 'function') {

                let clear = () => {
                    this._req_pool[_unqid] = null
                    delete this._req_pool[_unqid]
                }

                return new Promise((resolve, reject) => {
                    this._req_pool[_unqid] = [
                        resolve, reject, setTimeout(() => {
                            reject({code: 5, content: 'Timeout'});
                        }, REQ_TIMEOUT)
                    ]
                    this.$connection.send(message)
                })
                    .then(done, fail)
                    .finally(() => {
                        clear()
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
}

export default ETMSClient