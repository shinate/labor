export const UNKNOW = '未知错误'
export const TIMEOUT = '请求超时'
export const NO_SERVICE = '服务不可用'

const _CODE = {
    '-1' : UNKNOW,
    '0'  : 'success',
    '408': TIMEOUT,
    '503': NO_SERVICE
}

export const CODE = function (num) {
    return _CODE['' + num] || UNKNOW
}
