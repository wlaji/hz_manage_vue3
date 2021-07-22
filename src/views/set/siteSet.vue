<template>
    <div class="part part1">
        <h3>基本信息</h3>
        <div class="part-content">
            <div class="part-item" v-for="item in siteConfig" :key="item.configName">
                <template v-if="item.configName === 'websiteName'">
                    <label>{{item.configName}}</label>
                    <el-input v-model="item.keyValue" style="width: 400px"></el-input>
                    <el-button type="primary" class="ml-2" @click="save(item)">保存</el-button>
                </template>
                <template v-if="item.configName === 'banner'">
                    <label>网站logo:</label>
                    <Upload :imgList="JSON.parse(item.keyValue)" :isSingle="true" @deleteImg="deleteImg($event,item)" @addImg="addImg($event,item)"></Upload>
                    <el-button type="primary" class="ml-2" @click="save(item)">保存</el-button>
                </template>
                <template v-if="item.configName === 'carousel'">
                    <label>轮播图片列表:</label>
                    <Upload :imgList="JSON.parse(item.keyValue)" @deleteImg="deleteImg($event,item)" @addImg="addCarouse($event,item)"></Upload>
                    <el-button type="primary" class="ml-2" @click="save(item)">保存</el-button>
                </template>
            </div>
        </div>
    </div>
    <div class="part part3">
        <h3>导航设置</h3>
        <div class="part-content">
            <div class="part-item">
                <label>导航列表:</label>
                <div style="width: 400px">
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
                </div>
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
import {ConfigApi} from '@/api/config'
import {ElMessage, ElMessageBox} from 'element-plus';

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
            siteConfig: {},
            siteName: null,
            imgList: ['https://www.w3school.com.cn/i/eg_tulip.jpg'],
            carouseList: ['https://www.w3school.com.cn/i/eg_tulip.jpg', 'https://www.w3school.com.cn/i/eg_tulip.jpg', 'https://www.w3school.com.cn/i/eg_tulip.jpg'],
            navData: []
        });
        const appendNav = function (data) {
            const parentId = data.id;
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
        const deleteImg = function (index,item) {
            const imgList = JSON.parse(item.keyValue)
            imgList.splice(index, 1)
            item.keyValue = JSON.stringify(imgList)
        };
        const addImg = function (url,item) {
            item.keyValue = JSON.stringify([url])
        };

        const deleteCarousel = function () {

        };
        const addCarouse = function (url,item) {
            const imgList = JSON.parse(item.keyValue)||[]
            imgList.push(url)
            item.keyValue = JSON.stringify(imgList)
        };

        const save = function(data){
            ConfigApi.editConfig({
                id:data.id,
                groupName:data.groupName,
                configName:data.configName,
                keyValue:data.keyValue
            }).then(res=>{
                ElMessage.success('保存成功')
            })
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
                    state.navVisible = false;
                    ElMessage.success('添加成功');
                    getNavCategoryList()
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
        };

        const getNavCategoryList = function () {
            NavApi.getNavCategoryList().then(res => {
                state.navData = res.data
            }).catch(err => {
                console.log(err)
            })
        };
        const getAllConfig = function () {
            ConfigApi.getGroupInfo({
                groupName:'websiteSettings'
            }).then(res => {
                state.siteConfig = res.data
            }).catch(err => {
                console.log(err)
            })
        };
        onMounted(() => {
            getNavCategoryList();
            getAllConfig()
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
            navRules,
            deleteCarousel,
            addCarouse,
            save
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
            width: 100%;
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