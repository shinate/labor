import { arrayBufferToBase64, base64ToArrayBuffer } from './ab64'

const UINT8  = Symbol(),
      UINT16 = Symbol(),
      UINT32 = Symbol()


class palette {
    constructor(r, g, b) {
        return [r, g, b]
    }
}

class gif {

    _bytes

    _data = {}

    _p = 0

    $reader = new FileReader()

    constructor(imageData) {
        this.parse(imageData)
    }

    parse(imageData) {
        this._bytes = this.bytes(imageData)
        this.version = this.creeping(UINT8, 6, r => Array.from(r, u => String.fromCharCode(u)).join(''))

        if (!this.isGif(this.version)) {
            throw new TypeError('Not GIF given')
        }
        this.width = this.creeping(UINT16, 1, r => r[0])
        this.height = this.creeping(UINT16, 1, r => r[0])

        let tp = this.creeping(UINT8, 1, r => r[0])
        this.colorResolution = (tp >> 4 & 0x7) + 1;
        this.sorted = (tp & 0x8) ? true : false;

        this.backgroundIndex = this.creeping(UINT8, 1, r => r[0])
        this.pixelAspectRadio = this.creeping(UINT8, 1, r => r[0])
        if (tp & 0x80) {
            this.globalPalette = Array(... Array(2 << (tp & 0x7))).map(() => this.creeping(UINT8, 3, r => Array.prototype.slice.call(r)))
        }
        this.p(7)

        while (this.p() < this._bytes.length) {
            let p = this.creeping(UINT16, 1, r => r[0])
            console.log(p)
            if (p === 0xF921) {
                break
            }
        }

        console.log('p', this.p())
    }

    p(len = null) {
        if (len) {
            this._p += len
            return len
        } else {
            return this._p
        }
    }

    creeping(type, length, cb) {
        let part
        switch (type) {
            case UINT8:
                part = new Uint8Array(this._bytes, this.p(), this.p(length))
                break
            case UINT16:
                part = new Uint16Array(this._bytes, this.p(), this.p(length * 2))
                break
            case UINT32:
                part = new Uint16Array(this._bytes, this.p(), this.p(length * 4))
                break
        }

        return typeof cb === 'function' ? cb(part) : part
    }

    bytes(base64) {
        let comma = base64.indexOf(String.fromCharCode(0x2C))
        if (comma > -1) {
            base64 = base64.substr(comma + 1)
        }
        return base64ToArrayBuffer(base64)
    }

    isGif(c) {
        return /^GIF8[69]a/.test(c);
    }
}

export default gif