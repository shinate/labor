import proto from './proto'

const TYPE = Symbol()

class ENUM extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 1
    GETTER = 'getUint8'

    constructor(...args) {
        super(...args)
        switch (this.length) {
            case 1:
                this.GETTER = 'getUint8'
                break
            case 2:
                this.GETTER = 'getUint16'
                break
            case 4:
                this.GETTER = 'getUint32'
                break
            default:
                throw new TypeError('ENUM Length error!')
        }
        this.init()
    }
}

export default function (...args) {
    return new ENUM(...args)
}