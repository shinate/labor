import { atob, btoa } from './abab'

export const base64ToArrayBuffer = function base64ToArrayBuffer(base64) {
    let binary_string = atob(base64)
    let len = binary_string.length
    let bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
}

export const arrayBufferToBase64 = function arrayBufferToBase64(buffer) {
    let binary = ''
    let bytes = new Uint8Array(buffer)
    let len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary);
}

export default {
    base64ToArrayBuffer,
    arrayBufferToBase64
}