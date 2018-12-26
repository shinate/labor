import proto from './proto'

const TYPE = Symbol()

class UINT32 extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 4
    GETTER = 'getUint32'

    constructor(length = 1) {
        super(length)
    }
}

export default UINT32