<template>
    <div class="container">
        <div class="row">
            <div class="col-4 aside">
                <div class="title px-2 d-flex justify-content-between align-items-center">
                    <h3 class="mb-0">页面</h3>
                    <i class="el-icon-circle-plus-outline pointer" style="font-size:26px;font-weight: 600" title="添加页面"
                       @click="addPage"></i>
                </div>
                <div class="pageListWrap">
                    <ul>
                        <li class="p-2" v-for="item in pageList" :key="item.id">
                            <span>{{ item.pageName }}</span>
                            <span>
                                <i class="el-icon-edit text-primary" title="编辑页面" @click="editPage(item)"></i>
                                <i class="el-icon-delete ml-2" style="color:red" title="删除页面" @click="deletePage(item)"></i>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="col-8 content">
                <div class="title px-2 d-flex justify-content-between align-items-center">
                    <h3 class="mb-0">{{ pageForm.pageName ? pageForm.pageName : '添加新页面' }}</h3>
                    <i class="el-icon-circle-plus-outline pointer" style="font-size:26px;font-weight: 600"
                       title="添加富文本"></i>
                </div>
                <div class="pageContent py-2">
                    <el-form :model="pageForm" :rules="pageRules" ref="pageFormRef" label-width="100px">
                        <el-form-item label="页面名称" prop="pageName">
                            <el-input v-model="pageForm.pageName"></el-input>
                        </el-form-item>
                        <el-form-item label="标题">
                            <el-input v-model="pageForm.title"></el-input>
                        </el-form-item>
                        <el-form-item label="关键词">
                            <el-input v-model="pageForm.keyword"></el-input>
                        </el-form-item>
                        <el-form-item label="描述">
                            <el-input type="textarea" v-model="pageForm.description"></el-input>
                        </el-form-item>
                        <el-form-item label="结构化数据">
                            <el-input type="textarea" v-model="pageForm.structuring"></el-input>
                        </el-form-item>
                        <el-form-item label="富文本内容">
                            <editor :api-key="tinyApiKey" :init="tinymceInit" v-model="pageForm.content"/>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitPageForm">保存</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import {defineComponent, onMounted, reactive, toRefs, unref} from "vue";
import {SingleApi} from '@/api/single'
import {ConfigApi} from '@/api/config'
import {ElMessage, ElMessageBox} from "element-plus";
import Editor from '@tinymce/tinymce-vue'
import {NavApi} from "@/api/nav";

export default defineComponent({
    name: "singleManage",
    components: {
        Editor
    },
    setup() {
        const pageRules = {
            pageName: [
                {required: true, message: '请输入页面名称', trigger: 'blur'},
            ],
        };
        const state = reactive({
            tinyApiKey: 'cq62jh23yyvvxs4idil4zae2oxr774hszakvzwb7ab35lyk6',
            tinymceInit: {
                language: "zh_CN",
                height: 600,
                theme: "silver",
                browser_spellcheck: true, // 拼写检查
                branding: true, // 去水印
                // elementpath: false,  //禁用编辑器底部的状态栏
                statusbar: false, // 隐藏编辑器底部的状态栏
                menubar: true, // 隐藏最上方menu
                fontsize_formats:
                    "12px 13px 14px 15px 16px 17px 18px 20px 22px 24px 26px 30px 35px 40px 50px",
                plugins:
                    "print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount  imagetools  contextmenu colorpicker textpattern help code",
                toolbar:
                    "formatselect | bold italic strikethrough forecolor backcolor fontsizeselect | link image  | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat| code",
                paste_webkit_styles: true,
                //    上传方式1：填写images_upload_url和images_upload_base_path
                paste_data_images: true,  //  设置为允许粘帖图片
                images_upload_url: '/upload/file/tinymce', //  图片上传地址
                contextmenu: `inserttable | cell row column deletetable`,
                relative_urls: false,
                remove_script_host: false,
            },
            pageList: [],
            pageFormRef: null,
            pageForm: {
                pageName: '',
                title: '',
                description: '',
                keyword: '',
                structuring: '',
                content: ''
            }
        })
        const editPage = function (data) {
            state.pageForm = JSON.parse(JSON.stringify(data))
        };
        const addPage = function () {
            clearPageVisible()
        };
        const deletePage = function(data){
            ElMessageBox.confirm('此操作将删除此页面, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //调用删除接口
                SingleApi.deletePageById({
                    id:data.id
                }).then(() => {
                    clearPageVisible();
                    ElMessage.success('删除成功');
                    getPageList()
                }).catch(err => {
                    console.log(err)
                })
            }).catch(() => {

            });
        };
        const clearPageVisible = function () {
            //清空form
            const form = unref(state.pageFormRef);
            form.resetFields();
            state.pageForm = {
                pageName: '',
                title: '',
                description: '',
                keyword: '',
                structuring: '',
                content: ''
            };
        };
        const submitPageForm = function () {
            const form = unref(state.pageFormRef);
            if (!form) return;
            form.validate().then(() => {
                //添加页面
                SingleApi.editPage(state.pageForm).then(() => {
                    clearPageVisible();
                    ElMessage.success('操作成功');
                    getPageList()
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
        };
        const getPageList = function () {
            SingleApi.getPageList().then(res => {
                state.pageList = res.data
            }).catch(err => {
                console.log(err)
            })
        };
        onMounted(() => {
            getPageList();
        });
        return {
            ...toRefs(state),
            editPage,
            addPage,
            pageRules,
            submitPageForm,
            deletePage
        }
    }

});
</script>
<style scoped lang="scss">
.aside {
    .title {
        height: 40px;
        background-color: #f4f4f4;
        border-bottom: 1px solid #ddd;
    }

    .pageListWrap {
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 30px;
            cursor: pointer;

            &:hover {
                background-color: #f3f3f3;
            }
        }
    }
}

.content {
    background-color: #fff;

    .title {
        height: 40px;
        background-color: #eee;
        border-bottom: 1px solid #ddd;
    }
}
</style>