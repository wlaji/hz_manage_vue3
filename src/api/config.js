import request from "@/utils/request";

export const ConfigApi = {
    getAllConfig (params){
        return request({
            url: '/manage/getAllConfig',
            method: 'post',
            data:params
        })
    },
    editConfig (params){
        return request({
            url: '/manage/editConfig',
            method: 'post',
            data:params
        })
    },
    deleteConfig(params){
        return request({
            url: '/manage/deleteConfig',
            method: 'post',
            data:params
        })
    },
    getGroupInfo(params){
        return request({
            url: '/manage/getGroupInfo',
            method: 'post',
            data:params
        })
    },
};