"use strict"

import EventEmitter from 'events'

export default class WSAbstract {

    constructor() {
        this.$event = new EventEmitter()
    }

    on(...args) {
        this.$event.on.apply(this, args)
    }

    once(...args) {
        this.$event.once.apply(this, args)
    }

    off(...args) {
        this.$event.off.apply(this, args)
    }

    emit(...args) {
        this.$event.emit.apply(this, args)
    }
}