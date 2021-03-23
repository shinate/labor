/**
 * Created by shinate on 2018/12/25.
 */

export default class proto {

    callbacks = {}

    constructor(lengthOrCallback = 1) {
        this.length = lengthOrCallback
    }

    bind(BP) {
        this.$BP = BP
        this.offset = 0 + this.$BP._p
        return this
    }

    realLength() {
        if (typeof this.length === 'function') {
            this.length = this.length(this.$BP) || 1
        }
    }

    get() {
        this.realLength()
        this.dispatch('before')
        let part = []
        for (let i = 0; i < this.length; i++) {
            part.push(this.dispatch('afterPre', this.$BP.get(this.GETTER, i * this.BLOCK_LENGTH + this.offset)))
        }
        console.log('TYPE.proto.get.part', part)
        this.data = this.dispatch('after', part)
        this.byteLength = this.length * this.BLOCK_LENGTH

        return this
    }

    pointerBegin() {
        this.$BP._p = this.offset
        return this
    }

    pointerEnd() {
        this.$BP._p = this.offset + this.byteLength
        return this
    }

    parse() {
        return this.get().pointerEnd()
    }

    before(cb) {
        this.callbacks.before = cb
        return this
    }

    after(cb) {
        this.callbacks.after = cb
        return this
    }

    afterPre(cb) {
        this.callbacks.afterPre = cb
        return this
    }

    dispatch(type, arg) {
        if (this.callbacks.hasOwnProperty(type) && typeof this.callbacks[type] === 'function') {
            return this.callbacks[type](arg)
        }

        return arg
    }

    result() {
        if (Array.isArray(this.data) && this.data.length === 1) {
            return this.data[0]
        } else {
            return this.data
        }
    }
}