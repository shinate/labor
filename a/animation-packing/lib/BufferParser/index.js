class BufferParser {

    _p = 0

    _store = {}

    _littleEndian = (function () {
        let buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 0x100, true /* 设置值时使用小端字节序 */);
        // Int16Array 使用系统字节序，由此可以判断系统是否是小端字节序
        return new Int16Array(buffer)[0] === 0x100;
    })()

    constructor(buffer, protocol, _littleEndian = null) {
        this._protocol = protocol
        this.DATA = {}
        this._buffer = buffer
        this._dv = new DataView(this._buffer)
        if (_littleEndian !== null) {
            this._littleEndian = _littleEndian
        }

        this.parse()

        console.log(this)
    }

    parse() {
        this._protocol.forEach((RULE) => {
            let key = RULE[0], Parser = RULE[1], callback = RULE[2]
            let result = Parser.bind(this).parse().result()
            if (typeof callback === 'function') {
                result = callback(result, this)
            }
            if (typeof key === 'object') {
                Object.entries(key).forEach((item) => {
                    let key = item[0], mask = item[1]
                    this.DATA[key] = mask(result)
                })
            } else {
                this.DATA[key] = result
            }
        })
    }

    get(getter, offset) {
        return this._dv[getter](offset, this._littleEndian)
    }

    store(...args) {
        switch (args.length) {
            case 1: // get
                return this._store[args[0]]
            case 2: // set
                return this._store[args[0]] = args[1]
            default: // Do nothing
        }
    }

    _getting(type, offset, length = 1, cb) {
        let {getter, byteLength, callback} = this._TYPE[type]
        let part = []
        length *= byteLength
        for (let i = 0; i < length; i += byteLength) {
            part.push(this._dv[getter](offset + i))
        }

        if (typeof cb === 'function') {
            return cb(part)
        } else if (typeof callback === 'function') {
            return callback(part)
        } else if (length === 1) {
            return part[0]
        } else {
            return part
        }
    }

    _finding(condition, step = 1) {
        let _p = this._p
        for (; _p < this._dv.byteLength; _p += step) {
            if (condition.call(this, _p)) {
                break
            }
        }
        return _p
    }

    creeping(type, length = 1, cb = null) {
        let {byteLength} = this._TYPE[type]
        try {
            return this._getting(type, this._p, length, cb)
        } finally {
            this._p += length * byteLength
        }
    }

    detecting(condition, step = 1) {
        this._p = this._finding(condition, step)
    }
}

export default BufferParser