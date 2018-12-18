export const UNKNOW = '未知错误'
export const TIMEOUT = '请求超时'

const _CODE = {
    '-1' : UNKNOW,
    '0'  : 'success',
    '408': TIMEOUT
}

export const CODE = function (num) {
    return _CODE['' + num] || UNKNOW
}
