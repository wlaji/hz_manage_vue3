import axios from 'axios'
import qs from 'qs'
import Utils from '@/utils/util'
import {ElMessage} from 'element-plus';
import router from '@/router/index'

// 创建axios实例
const service = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? '/api' : 'https://sticker-api.gs-souvenir.com',
    timeout: 100000,
    transformRequest: [(data) => {
        data = JSON.stringify(data);
        return data
    }],
    headers: {
        get: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        post: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    },
});

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
const pending = new Map();

/**
 * 添加请求
 * @param {Object} config
 */
const addPending = (config) => {
    const url = [
        config.method,
        config.url,
        qs.stringify(config.params),
        qs.stringify(config.data)
    ].join('&');
    config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
        if (!pending.has(url)) { // 如果 pending 中不存在当前请求，则添加进去
            pending.set(url, cancel)
        }
    })
};

/**
 * 移除请求
 * @param {Object} config
 */
const removePending = (config) => {
    const url = [
        config.method,
        config.url,
        qs.stringify(config.params),
        qs.stringify(config.data)
    ].join('&');
    if (pending.has(url)) { // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
        const cancel = pending.get(url);
        cancel(url);
        pending.delete(url)
    }
};

/**
 * 清空 pending 中的请求（在路由跳转时调用）
 */
export const clearPending = () => {
    for (const [url, cancel] of pending) {
        cancel(url)
    }
    pending.clear()
};

// request拦截器
service.interceptors.request.use(
    (config) => {
        removePending(config); // 在请求开始前，对之前的请求做检查取消操作
        addPending(config); // 将当前请求添加到 pending 中
        const token = Utils.getCookie('token');
        if (token) {
            config.headers['token'] = token;
        }
        return config;
    },
    error => {
        return Promise.reject(error)
    }
);

// 响应拦截器
service.interceptors.response.use(
    (res) => {
        removePending(res); // 在请求结束后，移除本次请求
        //code 后台响应代码
        const code = res.data.code;
        if(res.status===200){
            if(code === 200){
                return res.data
            }else{
                ElMessage.error(res.data.message)
                return Promise.reject(res.data.message)
            }
        }else{
            return Promise.reject(res.data.message)
        }
    },
    error => {
        if (axios.isCancel(error)) {
            console.log('repeated request')
        } else {
            error.data = {};
            error.data.message = '请求超时或服务器异常，请检查网络或联系管理员！';
            ElMessage.error(error.data.message)
        }
        return Promise.reject(error)
    }
);

export default service
