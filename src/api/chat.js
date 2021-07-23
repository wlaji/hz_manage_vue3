import request from "@/utils/request";

export const ChatApi = {
    getSalesmanChatBox(params) {
        return request({
            url: '/chat/getSalesmanChatBox',
            method: 'get',
            params: params
        })
    }
};