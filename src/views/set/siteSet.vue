<template>
    <div class="part part1">
        <h3>基本信息</h3>
        <div class="part-content">
            <div class="part-item">
                <label>网站名称:</label>
                <el-input v-model="siteName"></el-input>
            </div>
            <div class="part-item w-100">
                <label>网站logo:</label>
                <Upload :imgList="imgList" :isSingle="true" @deleteImg="deleteImg" @addImg="addImg"></Upload>
            </div>
            <div class="part-item">
                <label></label>
                <el-button type="primary">保存</el-button>
            </div>
        </div>
    </div>
    <div class="part part2">
        <h3>首页轮播图</h3>
        <div class="part-content">
            <div class="part-item w-100">
                <label>轮播图片列表:</label>
                <Upload :imgList="imgList" @deleteImg="deleteImg" @addImg="addImg"></Upload>
            </div>
            <div class="part-item">
                <label></label>
                <el-button type="primary">保存</el-button>
            </div>
        </div>
    </div>
    <div class="part part3">
        <h3>导航设置</h3>
        <div class="part-content">
            <div class="part-item">
                <label>导航列表:</label>
                <el-tree
                        class="flex-1"
                        :data="navData"
                        :props="{
                            label:'name',
                            children:'children'
                        }"
                        default-expand-all
                        node-key="1000"
                        :expand-on-click-node="false">
                    <template #default="{ node, data }">
                        <span class="custom-tree-node">
                          <span>{{ node.label }}</span>
                          <div class="ml-3 d-inline-block">
                              <a href="javascript:;" class="mx-1" @click="editNav(data)">Edit</a>
                              <a href="javascript:;" class="mx-1" @click="appendNav(data)">Append</a>
                              <a href="javascript:;" class="mx-1" @click="removeNav(node, data)">Delete</a>
                          </div>
                        </span>
                    </template>
                </el-tree>
                <el-button type="primary" class="ml-3" @click="navVisible=true">添加一级导航</el-button>
            </div>
        </div>
    </div>

    <el-dialog
            title="添加导航"
            v-model="navVisible"
            width="30%"
            @close="handleCloseNavVisible">
        <div>
            <el-form :model="navForm" :rules="navRules" ref="navFormRef" @keyup.enter="submitNavForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="navForm.name"></el-input>
                </el-form-item>
                <el-form-item label="链接" prop="url">
                    <el-input v-model="navForm.url"></el-input>
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="navVisible=false">取 消</el-button>
                <el-button type="primary" @click="submitNavForm">确 定</el-button>
              </span>
        </template>
    </el-dialog>
</template>
<script>
    import {defineComponent, reactive, toRefs, unref, onMounted} from "vue";
    import Upload from '@/components/Upload.vue'
    import {NavApi} from "@/api/nav";
    import { ElMessage,ElMessageBox } from 'element-plus';
    let id = 1000;
    export default defineComponent({
        name: "SiteSet",
        components: {
            Upload
        },
        setup() {
            const navRules = {
                name: [
                    {required: true, message: '请输入导航名称', trigger: 'blur'},
                ],
                url: [
                    {required: true, message: '请输入导航链接地址', trigger: 'blur'},
                ]
            };
            const state = reactive({
                navVisible: false,
                navFormRef: null,
                navForm: {
                    name: '',
                    url: ''
                },
                siteName: null,
                imgList: ['https://www.w3school.com.cn/i/eg_tulip.jpg'],
                navData: [{
                    id: 1,
                    pageId: 1,
                    picPath: '',
                    name: '导航1',
                    url: '',
                    parentId: 0,
                    children: [{
                        id: 2,
                        pageId: 2,
                        picPath: '',
                        name: '导航1-1',
                        url: '',
                        parentId: 1,
                        children: [{
                            id: 3,
                            pageId: 3,
                            picPath: '',
                            name: '导航1-1-1',
                            url: '',
                            parentId: 2,
                        }, {
                            id: 4,
                            pageId: 4,
                            picPath: '',
                            name: '导航1--1-2',
                            url: '',
                            parentId: 2,
                        }]
                    }]
                }]
            });
            const appendNav = function (data) {
                const parentId = data.parentId;
                state.navForm['parentId'] = parentId;
                state.navVisible = true
            };
            const removeNav = function (node, data) {
                const {id} = data;
                ElMessageBox.confirm('此操作将删除此导航, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    //调用删除接口
                    NavApi.deleteNavCategory({id}).then(() => {
                        ElMessage.success('删除成功');
                        getNavCategoryList()
                    }).catch(err => {
                        console.log(err)
                    })
                }).catch(() => {

                });
            };
            const editNav = function (data) {
                console.log(data)
                const {id, parentId, pageId, picPath, name, url} = data;
                state.navForm['id'] = id;
                state.navForm['parentId'] = parentId;
                state.navForm['pageId'] = pageId;
                state.navForm['picPath'] = picPath;
                state.navForm['name'] = name;
                state.navForm['url'] = url;
                state.navVisible = true
            };
            //删除logo
            const deleteImg = function (index) {
                state.imgList.splice(index, 1)
            };
            const addImg = function (url) {
                state.imgList.push(url)
            };

            const handleCloseNavVisible = function () {
                //关闭导航弹窗前清空form
                const form = unref(state.navFormRef);
                form.resetFields();
                state.navForm = {
                    name: '',
                    url: ''
                };
            };
            const submitNavForm = function () {
                const form = unref(state.navFormRef);
                if (!form) return;
                form.validate().then(() => {
                    //添加导航
                    NavApi.editNavCategory(state.navForm).then(() => {
                        ElMessage.success('添加成功');
                        getNavCategoryList()
                    }).catch(err => {
                        console.log(err)
                    })
                }).catch(err => {
                    console.log(err)
                })
            };
            const getNavCategoryList = function(){
                NavApi.getNavCategoryList().then(res => {
                    console.log(res)
                }).catch(err => {
                    console.log(err)
                })
            };
            onMounted(() => {
                getNavCategoryList()
            });
            return {
                ...toRefs(state),
                appendNav,
                removeNav,
                editNav,
                deleteImg,
                addImg,
                handleCloseNavVisible,
                submitNavForm,
                navRules
            }
        }

    });
</script>
<style scoped lang="scss">
    .part {
        margin-bottom: 50px;
        h3 {
            height: 48px;
            line-height: 48px;
            text-indent: 15px;
            color: #60666a;
            font-weight: 700;
            border-left: 3px solid #55a290;
        }
        .part-content {
            margin-left: 20px;
            .part-item {
                width: 400px;
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                label {
                    flex-shrink: 0;
                    margin-right: 10px;
                    width: 100px;
                    font-size: 14px;
                }
            }
        }
    }
</style>