
import request from "@/utils/request";

export const uploadApi = {
    uploadFile(params){
        return request({
            url: '/file/upload',
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            transformRequest: [(data) => {
                return data
            }],
            data:params
        })
    }
};