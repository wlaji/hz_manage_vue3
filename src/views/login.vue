<template>
    <div class="loginWrap">
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @keyup.enter="submitForm">
            <h1 class="text-white mb-5 text-center">系统登录</h1>
            <el-form-item prop="userName">
                <el-input v-model="loginForm.userName" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" class="w-100" @click="submitForm">登 录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
    import {defineComponent, reactive, ref, unref} from "vue";
    import {useRouter} from 'vue-router';
    import {UserService} from "@/api/login";
    import Utils from '@/utils/util'
    export default defineComponent({
        name: "Login",
        setup() {
            const router = useRouter();
            const loginFormRef = ref(null);
            const loginForm = reactive({
                userName: '',
                password: ''
            });
            const loginRules = {
                userName: [
                    {required: true, message: '请输入用户名称', trigger: 'blur'},
                ],
                password: [
                    {required: true, message: '请输入密码', trigger: 'blur'},
                ]
            };
            const submitForm = () => {
                const form = unref(loginFormRef);
                if (!form) return;
                form.validate().then(() => {
                    const {userName, password} = loginForm;
                    UserService.login({
                        userName,
                        password
                    }).then((res) => {
                        //登录逻辑
                        console.log(res);
                        const token = res.data.token;
                        const userInfo = res.data.userInfo;
                        Utils.setCookie('token',token,1);
                        Utils.setCookie('userInfo',userInfo);
                        router.push('/')
                    }).catch(err=>{
                        console.log(err)
                    })

                }).catch(err => {
                    console.log(err)
                })
            };
            return {
                loginForm,
                loginRules,
                submitForm,
                loginFormRef
            }
        }

    });
</script>
<style scoped lang="scss">
    .loginWrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        background: #2d3a4b url('../assets/images/bg.jpg') center/cover no-repeat;
        .el-form {
            width: 400px;
            margin-top: 200px;
        }
    }
</style>