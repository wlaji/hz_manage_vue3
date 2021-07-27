<template>
    <div class="container">
        <div class="row">
            <div class="col-4 aside">
                <div class="title px-2 d-flex justify-content-between align-items-center">
                    <h3 class="mb-0">业务列表</h3>
                    <i class="el-icon-circle-plus-outline pointer" style="font-size:26px;font-weight: 600" title="添加新业务"
                       @click="addPage"></i>
                </div>
                <div class="pageListWrap">
                    <el-tree
                        class="flex-1"
                        :data="pageList"
                        :props="{
                            label:'name',
                            children:'children'
                        }"
                        default-expand-all
                        node-key="1000"
                        :expand-on-click-node="false">
                        <template #default="{ node, data }">
                        <span class="custom-tree-node d-flex justify-content-between align-items-center w-100">
                          <span>{{ node.label }}</span>
                          <div class="ml-3 d-inline-block">
                              <a href="javascript:;" class="mx-1" @click="editPage(data)">Edit</a>
                              <a href="javascript:;" class="mx-1" @click="addPage(data)">Append</a>
                              <a href="javascript:;" class="mx-1" @click="removePage(node, data)">Delete</a>
                          </div>
                        </span>
                        </template>
                    </el-tree>
                </div>
            </div>
            <div class="col-8 content">
                <div class="title px-2 d-flex justify-content-between align-items-center">
                    <h3 class="mb-0">{{ pageForm.id?'编辑业务':'添加新业务' }}</h3>
                    <i class="el-icon-circle-plus-outline pointer" style="font-size:26px;font-weight: 600"
                       title="添加富文本"></i>
                </div>
                <div class="pageContent py-2">
                    <el-form :model="pageForm" :rules="pageRules" ref="pageFormRef" label-width="100px">
                        <el-form-item label="业务名称" prop="name">
                            <el-input v-model="pageForm.name"></el-input>
                        </el-form-item>
                        <el-form-item label="业务描述" prop="description">
                            <el-input type="textarea" v-model="pageForm.description"></el-input>
                        </el-form-item>
                        <el-form-item label="业务Icon" prop="picPath">
                            <Upload :imgList="pageForm.picPath" :isSingle="true"
                                    @deleteImg="deleteImg($event,'picPath')"
                                    @addImg="addImg($event,'picPath')"></Upload>
                        </el-form-item>
                        <el-form-item label="业务链接" prop="url">
                            <el-input v-model="pageForm.url"></el-input>
                        </el-form-item>
                        <el-form-item label="背景大图">
                            <Upload :imgList="pageForm.background" :isSingle="true"
                                    @deleteImg="deleteImg($event,'background')"
                                    @addImg="addImg($event,'background')"></Upload>
                        </el-form-item>
                        <el-form-item label="业务背景">
                            <el-switch v-model="pageForm.isPureColor" active-text="背景色(16进制)"
                                       inactive-text="背景图" :active-value="1" :inactive-value="0"></el-switch>
                            <Upload :imgList="pageForm.backgroundImg" :isSingle="true"
                                    @deleteImg="deleteImg($event,'backgroundImg')"
                                    @addImg="addImg($event,'backgroundImg')"></Upload>
                            <el-input v-model="pageForm.backgroundColor" placeholder="背景色"></el-input>
                        </el-form-item>
                        <el-form-item label="标题">
                            <el-input v-model="pageForm.tdkJson.title"></el-input>
                        </el-form-item>
                        <el-form-item label="关键词">
                            <el-input v-model="pageForm.tdkJson.keyword"></el-input>
                        </el-form-item>
                        <el-form-item label="描述">
                            <el-input type="textarea" v-model="pageForm.tdkJson.description"></el-input>
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
import {BusinessApi} from '@/api/business'
import {ElMessage, ElMessageBox} from "element-plus";
import Editor from '@tinymce/tinymce-vue'
import {UploadApi} from "@/api/upload";
import Upload from '@/components/Upload.vue'
import {NavApi} from "@/api/nav";

export default defineComponent({
    name: "siteSet",
    components: {
        Editor,
        Upload
    },
    setup() {
        const pageRules = {
            // name: [
            //     {required: true, message: '请输入业务名称', trigger: 'blur'},
            // ],
        };
        const handleImgUpload = function (blobInfo, success, failure) {
            let formData = new FormData();
            formData.append('file', blobInfo.blob())
            UploadApi.uploadFile(formData).then(res => {
                const url = process.env.VUE_APP_URL + '/file/image' + res.data
                success(url)
            }).catch(err => {
                failure('上传失败')
            })
        }
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
                // images_upload_url: '/upload/file/tinymce', //  图片上传地址
                images_upload_handler: (blobInfo, success, failure) => {
                    handleImgUpload(blobInfo, success, failure)
                },
                image_prepend_url: process.env.VUE_APP_URL + '/file/image',
                contextmenu: `inserttable | cell row column deletetable`,
                relative_urls: false,
                remove_script_host: false,
            },
            pageList: [],
            pageFormRef: null,
            pageForm: {
                name: '',
                description: '',
                picPath: '',
                url: '',
                tdkJson: {
                    title: '',
                    description: '',
                    keyword: '',
                },
                content: '',
                isPureColor: 0,
                background: '',
                navJson: {
                    backgroundColor: '',
                    backgroundImg: '',
                },
                backgroundImg: '',
                backgroundColor: '',
            }
        });
        const editPage = function (data) {
            state.pageForm = JSON.parse(JSON.stringify(data))
            const {id, name, description, picPath, url, tdkJson,content,isPureColor,background,navJson,backgroundImg,backgroundColor} = data;
            state.pageForm['id'] = id;
            state.pageForm['name'] = name;
            state.pageForm['description'] = description;
            state.pageForm['picPath'] = picPath;
            state.pageForm['url'] = url;
            state.pageForm['tdkJson'] = JSON.parse(tdkJson);
            state.pageForm['content']=  content;
            state.pageForm['isPureColor']=  isPureColor;
            state.pageForm['background']=  background;
            state.pageForm['navJson']=  {};
            state.pageForm['backgroundImg']=  JSON.parse(navJson).backgroundImg;
            state.pageForm['backgroundColor']=  JSON.parse(navJson).backgroundColor;
        };
        const addPage = function (data) {
            clearPageVisible();
            if(data){
                state.pageForm.parentId = data.id
            }
        };
        const removePage = function(node,data){
            ElMessageBox.confirm('此操作将删除此页面, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //调用删除接口
                BusinessApi.deleteProfession({
                    id: data.id
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
                name: '',
                description: '',
                picPath: '',
                url: '',
                tdkJson: {
                    title: '',
                    description: '',
                    keyword: '',
                },
                content: '',
                isPureColor: 0,
                background: '',
                navJson: {
                    backgroundColor: '',
                    backgroundImg: '',
                },
                backgroundImg: '',
                backgroundColor: ''
            };
        };

        const addImg = function (url, key) {
            state.pageForm[key] = url
        };
        const deleteImg = function (url, key) {
            state.pageForm[key] = ''
        };

        const submitPageForm = function () {
            const form = unref(state.pageFormRef);
            if (!form) return;
            form.validate().then(() => {
                //添加页面
                let postData = {
                    name: state.pageForm.name,
                    description: state.pageForm.description,
                    picPath: state.pageForm.picPath,
                    url: state.pageForm.url,
                    tdkJson: JSON.stringify(state.pageForm.tdkJson),
                    content: state.pageForm.content,
                    isPureColor: state.pageForm.isPureColor,
                    background: state.pageForm.background,
                    navJson: JSON.stringify({
                        backgroundColor: state.pageForm.backgroundColor,
                        backgroundImg: state.pageForm.backgroundImg,
                    }),
                };
                if(state.pageForm.id){
                    postData = Object.assign({},postData,{id:state.pageForm.id})
                }
                if(state.pageForm.parentId){
                    postData = Object.assign({},postData,{parentId:state.pageForm.parentId})
                }
                BusinessApi.editProfession(postData).then(() => {
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
            BusinessApi.getProfessionList().then(res => {
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
            removePage,
            pageRules,
            submitPageForm,
            addImg,
            deleteImg
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