import proto from './proto'

const TYPE = Symbol()

class UINT8 extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 1
    GETTER = 'getUint8'

    constructor(...args) {
        super(...args)
        this.init()
    }
}

export default function (...args) {
    return new UINT8(...args)
}