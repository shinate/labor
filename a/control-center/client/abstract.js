import EventEmitter from 'events'

/**
 * Interface
 */
export default class abstract extends EventEmitter {
    onOpen() {
    }

    onMessage() {
    }

    onClose() {
    }

    onError() {
    }
}