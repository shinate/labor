import SET from './SET'

const TYPE = Symbol()

class LIST extends SET {
    TYPE = TYPE
    data = []

    constructor(proto, length = 1) {
        super()
        this.proto = proto
        this.length = length
    }

    parse() {
        this.realLength()
        for (let i = 0; i < this.length; i++) {
            this.data.push(this.get.call(this.$BP, this.proto[0], this.proto[1]))
        }
        return this
    }

    result() {
        return this.data
    }
}

export default LIST