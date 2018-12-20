import EventEmitter from 'events'

/**
 * Interface
 */
export default class abstract extends EventEmitter {

    // constructor() {
    // super()
    // this.$event = new EventEmitter()
    // }

    // on(...args) {
    //     this.$event.on.apply(this, args)
    // }
    //
    // once(...args) {
    //     this.$event.once.apply(this, args)
    // }
    //
    // off(...args) {
    //     this.$event.off.apply(this, args)
    // }
    //
    // emit(...args) {
    //     this.$event.emit.apply(this, args)
    // }

    onOpen() {
    }

    onMessage() {
    }

    onClose() {
    }

    onError() {
    }
}