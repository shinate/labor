/**
 * Created by shinate on 2018/12/25.
 */

export default class proto {

    callbacks = {}

    BLOCK_LENGTH = 1

    constructor(length = 1) {
        this.length = length
    }

    init() {
        console.log(this.BLOCK_LENGTH)
        this.byteLength = this.length * this.BLOCK_LENGTH
    }

    bind(BP) {
        this.$BufferParser = BP
        this.offset = 0 + this.$BufferParser._p
        return this
    }

    get() {
        this.dispatch('before')
        let part = []
        for (let i = 0; i < this.length; i++) {
            part.push(this.dispatch('afterPre', this.$BufferParser.get(this.GETTER, i * this.BLOCK_LENGTH + this.offset)))
        }
        console.log('TYPE.proto.get.part', part)
        this.data = this.dispatch('after', part)

        return this
    }

    pointerBegin() {
        this.$BufferParser._p = this.offset
        return this
    }

    pointerEnd() {
        this.$BufferParser._p = this.offset + this.byteLength
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