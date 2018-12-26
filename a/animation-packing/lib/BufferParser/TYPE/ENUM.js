import proto from './proto'

const TYPE = Symbol()

class ENUM extends proto {
    TYPE = TYPE
    BLOCK_LENGTH = 1
    GETTER = 'getUint8'

    constructor(length = 1, mask) {
        super(length)
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

        if (mask) {
            this.after(item => item[0] & mask)
        }
    }
}

export default ENUM