const EventEmitter = require('events');

const DEFAULT_CONFIG = {
    url: '',
    protocol: ''
}

class WSservice {

    constructor(config) {
        this.config = Object.assign({}, DEFAULT_CONFIG, config)
        this.$ws = null
        this.$event = new EventEmitter()
        this._messagePool = []
        this.on('open', this.releaseMessagePool)
        this.connect();
    }

    isOnline() {
        return this.$ws.readyState === WebSocket.OPEN
    }

    isOffline() {
        return this.$ws.readyState === WebSocket.CLOSED;
    }

    connect() {
        this.$ws = new WebSocket(this.config.url);

        this.$ws.onopen = () => {
            this.emit('open');
        }

        this.$ws.onmessage = (e) => {
            this.emit('message', e);
        }

        this.$ws.onclose = () => {
            this.emit('close');
        }
    }

    reconnect() {
        if (this.isOffline()) {
            this.connect();
        }
    }

    send(content) {
        if (this.isOnline()) {
            this.$ws.send(content);
        } else {
            this.reconnect();
            this._messagePool.push(content);
        }
    }

    close() {
        return this.$ws && this.$ws.close();
    }

    releaseMessagePool() {
        this._messagePool.forEach((message) => {
            this.$ws.send(message);
        })
    }

    on() {
        this.$event.on.apply(this, arguments);
    }

    once() {
        this.$event.once.apply(this, arguments);
    }

    off() {
        this.$event.off.apply(this, arguments);
    }

    emit() {
        this.$event.emit.apply(this, arguments);
    }
}

export default WSservice