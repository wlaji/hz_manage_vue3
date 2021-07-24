import {createRouter, createWebHistory} from 'vue-router'
//引入在axios暴露出的clearPending函数
import {clearPending} from "@/utils/request"
import Utils from '@/utils/util'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "Home" */ '../views/home.vue'),
        children: [
            {
                path: '',
                name: 'SystemHome',
                component: () => import(/* webpackChunkName: "SystemHome" */ '../views/systemHome.vue')
            },
            {
                path: 'set',
                name: 'Set',
                component: () => import(/* webpackChunkName: "Set" */ '../views/set/index.vue'),
                redirect: {
                    name: 'SiteSet'
                },
                children: [
                    {
                        path: 'siteSet',
                        name: 'SiteSet',
                        component: () => import(/* webpackChunkName: "SiteSet" */ '../views/set/siteSet.vue')
                    },
                    {
                        path: 'businessSet',
                        name: 'BusinessSet',
                        component: () => import(/* webpackChunkName: "BusinessSet" */ '../views/set/businessSet.vue')
                    },
                    {
                        path: 'singleManage',
                        name: 'SingleManage',
                        component: () => import(/* webpackChunkName: "SingleManage" */ '../views/set/singleManage.vue')
                    },
                ]
            },
            {
                path: 'service',
                name: 'Service',
                component: () => import(/* webpackChunkName: "Service" */ '../views/service/index.vue'),
                redirect: {
                    name: 'Service1'
                },
                children: [
                    {
                        path: 'service1',
                        name: 'Service1',
                        component: () => import(/* webpackChunkName: "Service1" */ '../views/service/service1.vue')
                    },
                    {
                        path: 'chat',
                        name: 'Chat',
                        component: () => import(/* webpackChunkName: "Chat" */ '../views/service/chat.vue')
                    }
                ]
            },
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "Login" */ '../views/login.vue')
    },
    {
        path: "/404",
        name: "404",
        component: () => import(/* webpackChunkName: "404" */ '../views/errorPage/404.vue')
    },
    {path: "/:pathMatch(.*)*", redirect: "/404"}
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

const whiteList = ['/login'];
router.beforeEach((to, from, next) => {
    //在跳转路由之前，先清除所有的请求
    clearPending();
    next()
    // let token = Utils.getCookie('token');
    // //路由跳转逻辑:如果不存再token,去其他页面跳转到登录页,如果存在token去往登陆页跳转到首页
    // if (!token) {
    //     if (whiteList.indexOf(to.path) >= 0) {
    //         next();
    //     } else {
    //         router.replace('/login');
    //     }
    // } else {
    //     if (to.path === '/login') {
    //         router.replace('/')
    //     } else {
    //         if (to.matched.length) {
    //             next();
    //         } else {
    //             router.replace('/login')
    //         }
    //     }
    // }
});

export default router
