import { arrayBufferToBase64, base64ToArrayBuffer } from './ab64'
import Lzw from './Lzw'
import GIFFrameDecorator from './GIFFrameDecorator'
import BufferParser from './BufferParser'
import TYPE from './BufferParser/TYPE/TYPE'

const UINT8  = Symbol(),
      UINT16 = Symbol(),
      UINT32 = Symbol()

class palette {
    constructor(r, g, b) {
        return [r, g, b]
    }
}

class gif {

    _littleEndian = (function () {
        let buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 0x100, true /* 设置值时使用小端字节序 */);
        // Int16Array 使用系统字节序，由此可以判断系统是否是小端字节序
        return new Int16Array(buffer)[0] === 0x100;
    })()

    _bytes
    _p = 0

    version
    frames = []
    width
    height
    colorResolution
    sorted
    backgroundIndex
    pixelAspectRadio

    constructor(imageData) {
        this.parse(imageData)
        GIFFrameDecorator(this)
        console.log(this)
    }

    parse(imageData) {
        this._bytes = this.bytes(imageData)
        this._DV = new DataView(this._bytes)
        this.$BP = new BufferParser(this._bytes, [
            [
                'version',
                TYPE.STRING(6),
                (r) => {
                    if (!this.isGif(r)) {
                        throw new TypeError('Not GIF given')
                    }
                    return r
                }
            ],
            ['width', TYPE.UINT16()],
            ['height', TYPE.UINT16()],
            ['colorResolution', TYPE.ENUM(1, 0x70), r => (r >> 4) + 1],
            ['sorted', TYPE.ENUM(1, 0x8), r => !!r],
            ['~globalPaletteFlag', TYPE.ENUM(1, 0x80), r => !!r],
            ['backgroundIndex', TYPE.UINT8()],
            ['pixelAspectRadio', TYPE.UINT8()],
            [
                'palette',
                TYPE.LIST([TYPE.UINT8(3)], 256)
            ] // 下不去了
        ])

        this.version = this.creeping(UINT8, 6, r => Array.from(r, u => String.fromCharCode(u)).join(''))

        if (!this.isGif(this.version)) {
            throw new TypeError('Not GIF given')
        }
        this.width = this.creeping(UINT16, 1)
        this.height = this.creeping(UINT16, 1)

        let tp = this.creeping(UINT8, 1)
        this.colorResolution = (tp >> 4 & 0x7) + 1;
        this.sorted = (tp & 0x8) ? true : false;

        this.backgroundIndex = this.creeping(UINT8, 1)
        this.pixelAspectRadio = this.creeping(UINT8, 1)
        if (tp & 0x80) {
            this.palette = Array(... Array(1 << this.colorResolution)).map(() => this.creeping(UINT8, 3, r => Array.prototype.slice.call(r)))
        }

        this.detecting((p) => {
            return this.getting(UINT8, 2, (part) => part[0] === 0x21 && part[1] === 0xF9)
        })

        if (this.p() === this._bytes.byteLength) { // Only one frame
            // this.detecting(UINT8, 0x2C)
            if (this.p() === this._bytes.length) {
                throw new Error('Can not find the image data!')
            }
            // var f = framPrototype();
            // if (!it.get.frame(i, f)) {
            //     return null;
            // } else {
            //     this.frames.push(f);
            // }
        } else { // Have multiple frames
            do {
                let frame = {}
                if (this.getting(UINT8, 1) === 0x21) {
                    this.p(3)
                    let _c = this.creeping(UINT8, 1) & 0x1
                    frame.delay = this.creeping(UINT16, 1)

                    if (_c & 1) {
                        frame.transparentIndex = this.creeping(UINT8, 1)
                        this.p(1)
                    } else {
                        this.p(2)
                    }
                    this.detecting(() => this.getting(UINT8, 1, part => part[0] === 0x2C), 1)
                    if (this.p() === this._bytes.byteLength) {
                        throw new Error('Can not find the image identifier!')
                    }
                }
                this.p(1)
                frame.offsetX = this.creeping(UINT16, 1)
                frame.offsetY = this.creeping(UINT16, 1)
                frame.width = this.creeping(UINT16, 1)
                frame.height = this.creeping(UINT16, 1)

                let f = this.creeping(UINT8, 1)

                if (f & 0x40) {
                    frame.interlace = true
                }
                if (f & 0x20) {
                    frame.sorted = true
                }
                if (f & 0x80) {
                    frame.colorResolution = (f & 0x7) + 1
                    frame.palette = Array(... Array(1 << frame.colorResolution)).map(() => this.creeping(UINT8, 3, r => Array.prototype.slice.call(r)))
                }
                // else {
                //     frame.colorResolution = this.colorResolution
                //     frame.localPalette = this.globalPalette
                // }
                let lzwLen = this.creeping(UINT8, 1, r => r[0] + 1)
                let len, block = []
                while (len = this.creeping(UINT8, 1)) {
                    block = block.concat(Array.prototype.slice.call(this.creeping(UINT8, len)))
                }
                frame.data = Lzw.decode(block, lzwLen);
                // frame.exactData = it.create.exactData(opts);
                //
                // return opts.data ? i - pos : 0;
                this.frames.push(frame)

                this.detecting((p) => {
                    return this.getting(UINT8, 2, (part) => part[0] === 0x21 && part[1] === 0xF9)
                })

            } while (this.p() < this._bytes.byteLength);
        }
    }

    p(len = null) {
        if (len) {
            this._p += len
            return len
        } else {
            return this._p
        }
    }

    detecting(condition, step = 1) {
        for (; this.p() < this._bytes.byteLength; this.p(step)) {
            try {
                if (condition(this.p())) {
                    break
                }
            } catch (e) {
                this._p = this._bytes.byteLength
            }
        }
    }

    getting(type, length, cb = null) {
        return this.creeping(type, length, cb, true)
    }

    creeping(type, length, cb, stay = false) {
        let _p = this.p(), _part = [], offset
        switch (type) {
            case UINT8:
                for (offset = 0; offset < length; offset++) {
                    _part.push(this._DV['getUint8'](_p + offset, this._littleEndian))
                }
                !stay && this.p(offset)
                break
            case UINT16:
                for (offset = 0; offset < length; offset += 2) {
                    _part.push(this._DV['getUint16'](_p + offset, this._littleEndian))
                }
                !stay && this.p(offset)
                break
            case UINT32:
                for (offset = 0; offset < length; offset += 4) {
                    _part.push(this._DV['getUint32'](_p + offset, this._littleEndian))
                }
                !stay && this.p(offset)
                break
        }

        return typeof cb === 'function' ? cb(_part) : _part.length === 1 ? _part[0] : _part
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