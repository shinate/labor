import randomatic from 'randomatic'
import _now from '../lib/now'

function _uniqueid() {
    return randomatic('Aa0', 7) + (+new Date).toString(36).substr(-3)
}

export const
    pack     = (cmd, source, target, content) => {
        return {
            cmd,
            type  : 'ETMS',
            source,
            target: target || 'CMC',
            unqid : _uniqueid(),
            time  : _now(),
            content
        }
    },
    unpack   = message => message,
    encrypt  = (message) => {
        return JSON.stringify(message)
    },
    decrypt  = (message) => {
        return JSON.parse(message)
    },
    emulator = (cmd, source, target, reqid, status, content) => {
        return encrypt({
            cmd,
            source,
            target,
            unqid: _uniqueid(),
            reqid,
            status,
            time : _now(),
            content
        })
    }