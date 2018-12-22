import abab from 'abab'

export const atob = window == null ? abab.atob : window.atob

export const btoa = window == null ? abab.btoa : window.btoa

export default {
    atob,
    btoa
}

