import request from "@/utils/request";

export function signup(data) {
    return request({
        url: '/user/signup',
        method: 'post',
        data
    })
}
export function signin(data) {
    return request({
        url: '/user/signin',
        method: 'post',
        data
    })
}
export function getUserInfo(data) {
    return request({
        url: '/user/getUserInfo',
        method: 'post',
        data
    })
}
export function updateUserInfo(data) {
    return request({
        url: '/user/updateUserInfo',
        method: 'post',
        data
    })
}
export function verifyEmail(data) {
    return request({
        url: '/user/verifyEmail',
        method: 'post',
        data
    })
}
export function verifyCode(data) {
    return request({
        url: '/user/verifyCode',
        method: 'post',
        data
    })
}
export function changePassword(data) {
    return request({
        url: '/user/changePassword',
        method: 'post',
        data
    })
}
export function getUserFavorite(data) {
    return request({
        url: '/user/getUserFavorite',
        method: 'post',
        data
    })
}
export function addFavorite(data) {
    return request({
        url: '/user/addFavorite',
        method: 'post',
        data
    })
}
export function removeFavorite(data) {
    return request({
        url: '/user/removeFavorite',
        method: 'post',
        data
    })
}