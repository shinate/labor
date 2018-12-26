import proto from './proto'
import ENUM from './ENUM'

const TYPE = Symbol()

class SET extends proto {

    TYPE = TYPE

    data = {}

    constructor(proto) {
        super()
        this.proto = proto
    }

    parse() {
        this.proto.forEach(RULE => {
            this.data[RULE[0]] = this.get.call(this, (RULE[1]), RULE[2])
        })
        return this
    }

    get(typeParser, callback) {
        let result
        if (typeParser instanceof ENUM) {
            if (this.$BufferParser.store('__ENUM__') === null) {
                result = typeParser.bind(this.$BufferParser).parse().result()
                this.$BufferParser.store('__ENUM__', result)
            } else {
                result = this.$BufferParser.store('__ENUM__')
            }
        } else {
            result = typeParser.bind(this.$BufferParser).parse().result()
            this.$BufferParser.store('__ENUM__', null)
        }
        if (typeof callback === 'function') {
            result = callback(result, this)
        }

        return result
    }

    clone(exp) {
        return Object.assign(Object.create(Object.getPrototypeOf(exp)), exp)
    }
}

export default SET