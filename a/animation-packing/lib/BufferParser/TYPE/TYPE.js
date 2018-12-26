import UINT8 from './UINT8'
import UINT16 from './UINT16'
import UINT32 from './UINT32'
import STRING from './STRING'
import ENUM from './ENUM'
import LIST from './LIST'
import SET from './SET'

const INS = {}

Object.entries({
    UINT8,
    UINT16,
    UINT32,
    STRING,
    ENUM,
    LIST,
    SET
}).forEach(item => {
    INS[item[0]] = (...args) => new item[1](...args)
})

export default INS