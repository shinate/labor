import randomatic from 'randomatic'

export const
    pack     = (cmd, source, target, content) => {
        return {
            cmd,
            type  : 'ETMS',
            source,
            target: target || 'CMC',
            unqid : unqid(),
            time  : now(),
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
            unqid: unqid(),
            reqid,
            status,
            time : now(),
            content
        })
    },
    unqid    = () => randomatic('Aa0', 7) + (+new Date).toString(36).substr(-3),
    now      = () => require('../lib/now')['default']