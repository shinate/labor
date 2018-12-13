export const
    encrypt = (cmd, source, target, unqid, content) => {
        return JSON.stringify({
            cmd,
            type: 'ETMS',
            source,
            target,
            unqid,
            time: +new Date,
            content
        })
    },
    decrypt = (message) => {
        return JSON.parse(message)
    }