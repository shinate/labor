import abstract from './abstract'
import * as EXCEPTION from './model/exception'

class service extends abstract {

    $ws = null

    constructor(url = null, protocol = null) {
        super()
        this.url = url
        this.protocol = protocol
        if (!this.url) {
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
        this.$ws = this.protocol ? new WebSocket(this.url, this.protocol) : new WebSocket(this.url)
        this.$ws.onopen = () => this.emit('open')
        this.$ws.onmessage = (e) => this.emit('message', e.data || null)
        this.$ws.onclose = () => this.emit('close')
        this.$ws.onerror = (e) => this.emit('error', e)
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

    onOpen(cb) {
        this.on('open', cb)
    }

    onMessage(cb) {
        this.on('message', cb)
    }

    onClose(cb) {
        this.on('close', cb)
    }

    onError(cb) {
        this.on('error', cb)
    }

    close() {
        return this.$ws && this.$ws.close()
    }
}

export default service