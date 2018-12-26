import proto from './proto'

const TYPE = Symbol()

class STRING extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 1
    GETTER = 'getUint8'

    constructor(length) {
        super()
        this.length = length
        this.afterPre(item => String.fromCharCode(item))
        this.after(item => item.join(''))
    }
}

export default STRING