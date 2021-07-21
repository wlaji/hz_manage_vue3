import request from "@/utils/request";

export const NavApi = {
    getNavCategoryList(){
        return request({
            url: '/manage/getNavCategoryList',
            method: 'post'
        })
    },
    /**
     *
     * @param params
     * id
     */
    deleteNavCategory(params){
        return request({
            url: '/manage/deleteNavCategory',
            method: 'post',
            data: params
        })
    },
    /**
     * @param params
     * id
     * pageId,
     * picPath,
     * name,
     * url
     * parentId
     */
    editNavCategory(params) {
        return request({
            url: '/manage/editNavCategory',
            method: 'post',
            data: params
        })
    }
};