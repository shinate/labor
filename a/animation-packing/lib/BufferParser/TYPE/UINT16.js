import proto from './proto'

const TYPE = Symbol()

class UINT16 extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 2
    GETTER = 'getUint16'

    constructor(length = 1) {
        super()
        this.length = length
    }
}

export default UINT16