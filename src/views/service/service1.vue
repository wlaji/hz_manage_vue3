<template>
    <div class="wrap border h-100 position-absolute">
        <div class="h-100 content">
            <div class="border h-100 d-flex">
                <div class="h-100 chatListWrap">
                    <el-scrollbar>
                        <ul class="chatList">
                            <li v-for="(item,index) in chatBoxList" :key="index" class="d-flex align-items-center">
                                <el-avatar
                                    src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                                <span class="ml-2">{{ item.customName }}</span>
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
import {defineComponent, reactive, toRefs, onMounted, onUnmounted} from "vue";
import {ChatApi} from "@/api/chat";
import {ElMessage, ElMessageBox, ElNotification} from "element-plus";

export default defineComponent({
    name: "service1",
    setup() {
        let serviceName = sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')).userName : '客服小和正';// 昵称
        const serviceId = JSON.parse(sessionStorage.getItem('userInfo')).id
        let wsUrl = `${process.env.VUE_APP_WS + serviceName}`
        let websocket = null
        const state = reactive({
            inputText: '',
            aisle: "", // 对方频道号
            messageList: [], // 消息列表
            messageValue: "", // 消息内容
            chatBoxList: [],
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
                state.inputText += "\n"; //换行
            } else if (e.keyCode === 13) {
                console.log('发送消息:' + formatInput(e.target.value));
                state.inputText = '';
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
                console.log("aaa")
            };

            //连接成功建立的回调方法
            websocket.onopen = function (event) {
                console.log("连接成功了呀哈哈哈哈", event)
                ChatApi.getSalesmanChatBox({salesmanId: serviceId}).then(res => {
                    console.log(res)
                    res.data.forEach(oneBox => {
                        let newChatBox = JSON.parse(JSON.stringify(state.chatBox));
                        newChatBox.customSessionId = oneBox.customSessionId;
                        newChatBox.customName = oneBox.customName;
                        state.chatBoxList.push(newChatBox);
                    })
                })
            };

            //接收到消息的回调方法
            websocket.onmessage = function (event) {
                let object = eval("(" + event.data + ")");
                console.log(object);
                if (object.type == 0) {
                    // 提示连接成功
                    console.log("连接成功");
                    let newChatBox = JSON.parse(JSON.stringify(that.chatBox));
                    newChatBox.customSessionId = object.aisle;
                    newChatBox.customName = object.name;
                    that.chatBoxList.push(newChatBox);
                    that.showInfo(object.people, object.aisle);
                }
                if (object.type == 1) {
                    //显示消息
                    console.log("接受消息", object);
                    let aa = that.chatBoxList.filter(chatBox =>
                        chatBox.customSessionId === object.customSessionId
                    )
                    if (aa.length) {
                        aa[0].messageList.push(object);
                    }
                }
            };

            //连接关闭的回调方法
            websocket.onclose = function () {

            };
        }
        // 发送消息
        const sendMessage = function (chat) {
            var socketMsg = {msg: chat.sendMessage, toUser: chat.customSessionId};
            socketMsg.type = 1;
            this.websocket.send(JSON.stringify(socketMsg));
        }
        const showInfo = function (people, aisle) {
            this.$notify({
                title: "当前在线人数：" + people,
                message: "您的频道号：" + aisle,
                duration: 0
            });
        }
        onMounted(() => {
            connectWebSocket()
        })
        //关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        onUnmounted(() => {
            websocket.close()
        })
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
        /deep/ .el-textarea__inner {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 0;
        }
    }
}
</style>