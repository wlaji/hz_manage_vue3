<template>
    <div class="wrap border h-100 position-absolute">
        <div class="h-100 content">
            <div class="border h-100 d-flex">
                <div class="h-100 chatListWrap">
                    <el-scrollbar>
                        <ul class="chatList">
                            <li v-for="(item,index) in chatBoxList" :key="index" class="d-flex align-items-center"
                                @click="selectUser(index)">
                                <el-avatar icon="el-icon-user-solid"></el-avatar>
                                <span class="ml-2">{{ item.customName }}{{index+1}}</span>
                            </li>
                        </ul>
                    </el-scrollbar>
                </div>
                <div class="flex-1 h-100 chatContent d-flex flex-column">
                    <div class="chatArea flex-1 d-flex flex-column" style="height:0;">
                        <!--<div class="header">-->
                        <!--中国,上海-->
                        <!--</div>-->
                        <div class="con flex-1" style="height:0;">
                            <el-scrollbar>
                                <ul class="messageList" v-for="(value,index) in selectChat.messageList" :key="index">
                                    <el-tag v-if="value.name=='客服00'+serviceId" type="success" style="float:right">
                                        我：<span v-html="value.msg"></span>
                                    </el-tag>
                                    <br/>
                                    <el-tag v-if="value.name!='客服00'+serviceId" style="float:left">
                                        {{value.name}}：<span v-html="value.msg"></span>
                                    </el-tag>
                                    <br/>
                                </ul>
                            </el-scrollbar>
                        </div>
                    </div>
                    <div class="inputArea">
                        <el-input
                                :disabled="selectChat.length===0"
                                type="textarea"
                                placeholder="在这里输入,按 Enter 发送,按 Ctrl + Enter 换行"
                                v-model.trim="selectChat.sendMessage"
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
    import {defineComponent, reactive, toRefs, onMounted, onUnmounted} from "vue";
    import {ChatApi} from "@/api/chat";
    import {ElNotification} from "element-plus";
    import {useRouter} from 'vue-router';
    import Utils from '@/utils/util'

    export default defineComponent({
        name: "chat",
        setup() {
            const router = useRouter();
            let serviceName = Utils.getCookie('userInfo') ? JSON.parse(Utils.getCookie('userInfo')).userName : '客服和正';// 昵称
            const serviceId = Utils.getCookie('userInfo') ? JSON.parse(Utils.getCookie('userInfo')).id : null;
            if (!serviceId) {
                Utils.removeCookie('token');
                Utils.removeCookie('userInfo');
                router.push('/login');
            }
            let wsUrl = `${process.env.VUE_APP_WS + serviceId}`;
            let websocket = null;
            const state = reactive({
                inputText: '',
                aisle: "", // 对方频道号
                chatBoxList: [],
                selectChat: [],
                chatBox: {
                    customSessionId: '',
                    salesmanId: '',
                    sendMessage: '',
                    customName: '',
                    messageList: []
                }
            });
            const formatInput = function (str) {
                return str.replace(/\n/g, '<br/>')
            };
            const enterInput = function (e) {
                if (e.keyCode === 13 && e.ctrlKey) {
                    state.selectChat.sendMessage += "\n"; //换行
                } else if (e.keyCode === 13) {
                    state.selectChat.sendMessage = formatInput(state.selectChat.sendMessage)
                    sendMessage(state.selectChat);
                    state.selectChat.sendMessage = '';
                    e.preventDefault();//禁止回车的默认换行
                }
            };

            const connectWebSocket = function () {
                console.log("建立连接");
                //判断当前浏览器是否支持WebSocket
                if ("WebSocket" in window) {
                    websocket = new WebSocket(wsUrl);
                } else {
                    ElNotification({
                        title: '浏览器不支持建立socket连接',
                        message: '请更换浏览器',
                        position: 'top-right',
                        type: 'error'
                    });
                    return
                }

                //连接发生错误的回调方法
                websocket.onerror = function () {
                    console.log("连接错误")
                };

                //连接成功建立的回调方法
                websocket.onopen = function () {
                    ChatApi.getSalesmanChatBox({salesmanId: serviceId}).then(res => {
                        console.log('连接成功了回调参数', res);
                        res.data.forEach(oneBox => {
                            let newChatBox = JSON.parse(JSON.stringify(state.chatBox));
                            newChatBox.customSessionId = oneBox.customSessionId;
                            newChatBox.customName = oneBox.customName;
                            state.chatBoxList.push(newChatBox);
                        });
                    })
                };

                //接收到消息的回调方法
                websocket.onmessage = function (event) {
                    console.log(event);
                    let object = eval("(" + event.data + ")");
                    if (object.type == 0) {
                        // 提示连接成功
                        console.log("连接成功");
                        let newChatBox = JSON.parse(JSON.stringify(state.chatBox));
                        newChatBox.customSessionId = object.aisle;
                        newChatBox.customName = object.name;
                        state.chatBoxList.push(newChatBox);
                    }
                    if (object.type == 1) {
                        //显示消息
                        console.log("接受消息", object, state.chatBoxList);
                        let chat = state.chatBoxList.find(chatBox => {
                            return chatBox.customSessionId === object.customSessionId;
                        });
                        if (chat) {
                            chat.messageList.push(object);
                            console.log(state.chatBoxList)
                        }
                    }
                };
                websocket.onclose = function (e) {
                    console.log('连接关闭', e);
                }
            };
            // 发送消息
            const sendMessage = function (chat) {
                let socketMsg = {
                    msg: chat.sendMessage,
                    toUser: chat.customSessionId,
                    type: 1
                };
                websocket.send(JSON.stringify(socketMsg));
            };
            const selectUser = function (index) {
                state.selectChat = state.chatBoxList[index];
            };
            onMounted(() => {
                connectWebSocket()
            });
            //关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
            onUnmounted(() => {
                websocket.close()
            });
            return {
                ...toRefs(state),
                enterInput,
                serviceId,
                selectUser
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
        }
    }

    .chatContent {
        height: 100%;

        .chatArea {
            padding: 10px;

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
            /deep/ .el-textarea__inner {
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 0;
            }
        }
    }
</style>