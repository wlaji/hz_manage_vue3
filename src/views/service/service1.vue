<template>
    <div class="wrap border h-100 position-absolute">
        <div class="h-100 content">
            <div class="border h-100 d-flex">
                <div class="h-100 chatListWrap">
                    <el-scrollbar>
                        <ul class="chatList">
                            <li v-for="(item,index) in 100" :key="index" class="d-flex align-items-center">
                                <el-avatar
                                        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                                <span class="ml-2">{{item.name}}{{index+1}}</span>
                            </li>
                        </ul>
                    </el-scrollbar>
                </div>
                <div class="flex-1 h-100 chatContent d-flex flex-column">
                    <div class="chatArea flex-1 d-flex flex-column" style="height:0;">
                        <div class="header">
                            中国,上海
                        </div>
                        <div class="con flex-1 py-2" style="height:0;">
                            <el-scrollbar>
                                <ul class="messageList">

                                </ul>
                            </el-scrollbar>
                        </div>
                    </div>
                    <div class="inputArea">
                        <el-input
                                type="textarea"
                                placeholder="在这里输入,按 Enter 发送,按 Ctrl + Enter 换行"
                                v-model.trim="inputText"
                                autofocus
                                @keydown="enterInput"
                        >
                        </el-input>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {defineComponent, reactive, toRefs} from "vue";

    export default defineComponent({
        name: "service1",
        setup() {
            const state = reactive({
                inputText:'',
                chatList: [
                    {
                        name: '访客'
                    },
                    {
                        name: '访客'
                    },
                    {
                        name: '访客'
                    },
                    {
                        name: '访客'
                    },
                    {
                        name: '访客'
                    },
                    {
                        name: '访客'
                    }
                ]
            });
            const formatInput= function(str){
                return str.replace(/\n/g,'<br/>')
            };
            const enterInput = function(e){
                if(e.keyCode === 13 && e.ctrlKey){
                    state.inputText += "\n"; //换行
                }else if(e.keyCode === 13){
                    console.log('发送消息:'+formatInput(e.target.value));
                    state.inputText = '';
                    e.preventDefault();//禁止回车的默认换行
                }
            };
            return {
                ...toRefs(state),
                enterInput
            }
        }
    });
</script>
<style scoped lang="scss">
    .wrap {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: #E9EDF1;
        padding: 10px;
        .content {
            background-color: #fff;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
            border-radius: 4px;
            padding: 20px;
        }
    }

    .chatListWrap {
        min-width: 300px;
        border-right: 1px solid #ccc;
    }

    .chatList {
        height: 100%;
        li {
            height: 50px;
            font-size: 14px;
            border-bottom: 1px solid #E7E7E7;
            cursor: pointer;
            border-left: 3px solid transparent;
            &.active {
                border-left-color: #31449F;
                background-color: #E7E7E7;
            }
            &:hover {
                border-left: 3px solid #31449F;
                background-color: #E7E7E7;
            }
            &:last-child {
                border-bottom: none;
            }
        }
    }

    .chatContent {
        height: 100%;
        .chatArea {
            padding: 20px;
            .header {
                height: 40px;
                line-height: 40px;
                background-color: #E7E7E7;
                text-align: center;
            }
        }
        .inputArea {
            min-height: 300px;
            border-top: 1px solid #ccc;
            /deep/ .el-textarea,
            /deep/ .el-textarea__inner{
                width: 100%;
                height: 100%;
                border:none;
                border-radius: 0;
            }
        }
    }
</style>