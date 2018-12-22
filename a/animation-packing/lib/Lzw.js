export default {
    decode: function decode(arrBytes, nBits) {

        let cc = 1 << (nBits - 1)

        let eoi = cc + 1

        let table = [], mask = [], result = []

        for (let i = 0; i < cc; i++) {
            table[i] = '' +
                (i >> 8 & 0xf).toString(16) +
                (i >> 4 & 0xf).toString(16) +
                (i & 0xf).toString(16)
        }

        mask[1] = 1
        for (let i = 2; i < 13; i++) {
            mask[i] = mask[i - 1] << 1 | 1
        }

        let bc = nBits

        let pos = 0, temp = 0, tleft = 0, code = 0, old = 0

        while (true) {
            while (tleft < bc) {
                temp = temp | (arrBytes[pos++] << tleft)
                tleft += 8
            }
            code = temp & mask[bc]
            tleft -= bc
            temp >>= bc
            if (code == eoi) {
                break
            }
            if (code == cc) {
                table.length = cc + 2
                bc = nBits
                old = code
                continue
            }
            let t = ""
            if (code < table.length) {
                t = table[code]
                if (old != cc) {
                    table.push(table[old] + t.slice(0, 3))
                }
            } else if (old < table.length) {
                t = table[old] + table[old].slice(0, 3)
                table.push(t)
            } else {
                throw "ERROR：Image data is invalid"
                return
            }

            old = code
            for (let i = 0; i < t.length; i += 3) {
                result.push(parseInt(t.substr(i, 3), 16))
            }
            if (table.length == 1 << bc && bc < 12) {
                bc++
            }
        }
        return result
    }
}
