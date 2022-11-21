import {isEmpty} from "../utils/utils";

export function hasPermission(owner) {
    let userJsonStr = sessionStorage.getItem('user');
    if (isEmpty(userJsonStr)) {
        return false;
    }
    let user = JSON.parse(userJsonStr);
    if (user['type'] === '管理组') {
        return true;
    }

    return user['id'] === owner;
}

export function isAdmin() {
    let userJsonStr = sessionStorage.getItem('user');
    if (isEmpty(userJsonStr)) {
        return false;
    }
    let user = JSON.parse(userJsonStr);
    return user['type'] === '管理组';
}

export function getCurrentUser() {
    let userJsonStr = sessionStorage.getItem('user');
    if (isEmpty(userJsonStr)) {
        return {};
    }

    return JSON.parse(userJsonStr);
}
