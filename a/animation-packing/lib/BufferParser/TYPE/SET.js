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
            let condition = true
            if (typeof RULE[0] !== 'string') {
                condition = RULE.shift()
                switch (typeof condition) {
                    case 'function':
                        condition = condition(this.$BP)
                        break
                    case 'number':
                        condition = !!condition
                        break
                    case 'boolean':
                        break
                }
            }

            if (condition && RULE[0]) {
                this.data[RULE[0]] = this.get.call(this.$BP, RULE[1], RULE[2])
            }
        })

        return this
    }

    get(typeParser, callback) {
        let result
        if (typeParser instanceof ENUM) {
            if (this.store('__ENUM__') === null) {
                result = typeParser.bind(this).parse().result()
                this.store('__ENUM__', result)
            } else {
                result = this.store('__ENUM__')
            }
        } else {
            result = typeParser.bind(this).parse().result()
            this.store('__ENUM__', null)
        }

        if (typeof callback === 'function') {
            result = callback(result, this)
        }

        return result
    }

    clone(exp) {
        return Object.assign(Object.create(Object.getPrototypeOf(exp)), exp)
    }

    result() {
        return {...this.data}
    }
}

export default SET