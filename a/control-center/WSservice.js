var EventEmitter = require('events');

var DEFAULT_CONFIG = {
    url: '',
    protocol: ''
};

function WSservice(config) {
    this.config = Object.assign({}, DEFAULT_CONFIG, config);
    this.$ws = null;
    this.$event = new EventEmitter();
    this._messagePool = [];

    this.on('open', this.releaseMessagePool);
    this.connect();
}

var WSSP = WSservice.prototype;

WSSP.isOnline = function () {
    return this.$ws.readyState === WebSocket.OPEN;
};

WSSP.isOffline = function () {
    return this.$ws.readyState === WebSocket.CLOSED;
};

WSSP.connect = function () {
    this.$ws = new WebSocket(this.config.url);

    this.$ws.onopen = function () {
        this.emit('open');
    }.bind(this);

    this.$ws.onmessage = function (e) {
        this.emit('message', e);
    }.bind(this);

    this.$ws.onclose = function () {
        this.emit('close');
    }.bind(this);
};

WSSP.reconnect = function () {
    if (this.isOffline()) {
        this.connect();
    }
};

WSSP.send = function (content) {
    if (this.isOnline()) {
        this.$ws.send(content);
    } else {
        this.reconnect();
        this._messagePool.push(content);
    }
};

WSSP.close = function () {
    return this.$ws && this.$ws.close();
};

WSSP.releaseMessagePool = function () {
    this._messagePool.forEach(function (message) {
        this.$ws.send(message);
    }.bind(this));
};

WSSP.on = function () {
    this.$event.on.apply(this, arguments);
};

WSSP.once = function () {
    this.$event.once.apply(this, arguments);
};

WSSP.off = function () {
    this.$event.off.apply(this, arguments);
};

WSSP.emit = function () {
    this.$event.emit.apply(this, arguments);
};

module.exports = WSservice;