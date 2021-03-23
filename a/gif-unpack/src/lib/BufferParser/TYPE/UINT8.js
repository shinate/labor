import proto from './proto'

const TYPE = Symbol()

class UINT8 extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 1
    GETTER = 'getUint8'

    constructor(length = 1) {
        super(length)
    }
}

export default UINT8