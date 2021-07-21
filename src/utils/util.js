import Cookies from 'js-cookie'

const Utils = {
    getCookie(key) {
        return Cookies.get(key)
    },

    setCookie(key, value, expires) {
        return Cookies.set(key, value,{ expires: expires })
    },

    removeCookie(key) {
        return Cookies.remove(key)
    }
};
export default Utils
