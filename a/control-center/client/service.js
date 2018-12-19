"use strict"

import WSAbstract from './abstract'
import * as EXCEPTION from './model/exception'

const DEFAULT_CONFIG = {
    url     : '',
    protocol: ''
}

class WSService extends WSAbstract {

    $ws = null
    config = {}

    constructor(config) {
        super()
        this.config = {...DEFAULT_CONFIG, ...config}
        if (this.config.url === '') {
            throw new Error(EXCEPTION.NO_SERVICE)
        }
        this.connect()
    }

    /**
     * Is online
     * @private
     * @returns {boolean}
     */
    isOnline() {
        return this.$ws.readyState === WebSocket.OPEN
    }

    /**
     * Is offline
     * @private
     * @returns {boolean}
     */
    isOffline() {
        return this.$ws.readyState === WebSocket.CLOSED;
    }

    /**
     * Connect
     * @private
     */
    connect() {
        this.$ws = new WebSocket(this.config.url)

        this.$ws.onopen = () => {
            // console.log(e)
            this.emit('open')
        }

        this.$ws.onmessage = (e) => {
            // console.log(e)
            this.emit('message', e.data || null)
        }

        this.$ws.onclose = () => {
            // console.log(e)
            this.emit('close')
        }
    }

    /**
     * Reonnect
     * @private
     */
    reconnect() {
        if (this.isOffline()) {
            this.connect()
        }
    }

    send(content) {
        this.$ws.send(content)
    }

    onConnect(cb) {
        this.on('open', cb)
    }

    onMessage(cb) {
        this.on('message', cb)
    }

    onDisconnect(cb) {
        this.on('close', cb)
    }

    close() {
        return this.$ws && this.$ws.close()
    }
}

export default WSService