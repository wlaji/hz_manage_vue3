import request from "@/utils/request";

export const SingleApi = {
    editPage(params){
        return request({
            url: '/manage/editPage',
            method: 'post',
            data:params
        })
    },
    getPageList(params){
        return request({
            url: '/manage/getPageList',
            method: 'post',
            data:params
        })
    },
    deletePageById(params){
        return request({
            url: '/manage/deletePageById',
            method: 'post',
            data:params
        })
    }
};