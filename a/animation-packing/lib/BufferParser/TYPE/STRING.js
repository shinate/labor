import proto from './proto'

const TYPE = Symbol()

class STRING extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 1
    GETTER = 'getUint8'

    constructor(...args) {
        super(...args)
        this.init()
        this.afterPre(item => String.fromCharCode(item))
        this.after(item => item.join(''))
    }
}

export default function (...args) {
    return new STRING(...args)
}