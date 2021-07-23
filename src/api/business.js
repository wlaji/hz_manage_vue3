import request from "@/utils/request";

export const BusinessApi = {
    getProfessionList(params){
        return request({
            url: '/manage/getProfessionList',
            method: 'post',
            data:params
        })
    },
    editProfession(params){
        return request({
            url: '/manage/editProfession',
            method: 'post',
            data:params
        })
    },
    deleteProfession(params){
        return request({
            url: '/manage/deleteProfession',
            method: 'post',
            data:params
        })
    }
};