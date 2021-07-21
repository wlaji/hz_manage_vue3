import request from "@/utils/request";

export const UserService = {
    /**
     * @param params
     * userName -用户名
     * password -用户密码
     */
    login(params) {
        return request({
            url: '/login',
            method: 'post',
            data: params
        })
    }
};