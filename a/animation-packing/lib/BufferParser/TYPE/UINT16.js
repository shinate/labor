import proto from './proto'

const TYPE = Symbol()

class UINT16 extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 2
    GETTER = 'getUint16'

    constructor(...args) {
        super(...args)
        this.init()
    }
}

export default function (...args) {
    return new UINT16(...args)
}