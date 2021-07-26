<template>
    <div>
        <el-button type="primary" @click="connectService">联系我们</el-button>
        <el-button type="primary" @click="connectClose">断开连接</el-button>
        <el-dialog
            title="发送留言"
            v-model="visible"
            width="30%">
            <div>
                <div class="message" style="height:500px;overflow: auto">
                    <div v-for="(value,key,index) in messageList" :key="index">
                        <el-tag v-if="value.name=='User'" type="success" style="float:right">我：{{ value.msg }}</el-tag>
                        <br/>
                        <el-tag v-if="value.name!='User'" style="float:left">{{ value.name }}：{{ value.msg }}</el-tag>
                        <br/>
                    </div>
                </div>
                <el-input
                    type="textarea"
                    rows="2"
                    placeholder="在这里输入,按 Enter 发送,按 Ctrl + Enter 换行"
                    v-model.trim="inputText"
                    autofocus
                    @keydown="enterInput"
                >
                </el-input>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {defineComponent, onUnmounted, reactive, toRefs} from "vue";

export default defineComponent({
    name: "chat",
    setup() {
        let serviceName = "User";// 昵称
        let wsUrl = `ws://121.40.112.169:55505/websocket/custom?nickname=${serviceName}`;
        let websocket = null;
        const state = reactive({
            visible: false,
            name: "", // 昵称
            websocket: null, // WebSocket对象
            aisle: "", // 对方频道号
            messageList: [], // 消息列表
            messageValue: "", // 消息内容
            inputText: '',
        });
        const connectWebSocket = function () {
            //判断当前浏览器是否支持WebSocket
            if ("WebSocket" in window) {
                websocket = new WebSocket(wsUrl);
            } else {
                alert("不支持建立socket连接");
            }
            //连接发生错误的回调方法
            websocket.onerror = function (event) {
                console.log("连接错误", event)
            };

            //连接成功建立的回调方法
            websocket.onopen = function (event) {
                console.log("连接成功", event)
            };

            //接收到消息的回调方法
            websocket.onmessage = function (event) {
                console.log(event);
                let object = eval("(" + event.data + ")");
                if (object.type === 0) {
                    // 提示连接成功
                    console.log("连接成功");
                }
                if (object.type === 1) {
                    //显示消息
                    console.log("接受消息");
                    state.messageList.push(object);
                }
            };
            //连接关闭的回调方法
            websocket.onclose = function (event) {
                console.log('客户端连接关闭',event)
            };
        };
        // 发送消息
        const sendMessage = function () {
            let socketMsg = {
                msg: state.inputText,
                toUser: state.aisle,
                type: 1
            };
            websocket.send(JSON.stringify(socketMsg));
        };
        const connectService = function () {
            state.visible = true;
            connectWebSocket()
        };
        const formatInput = function (str) {
            return str.replace(/\n/g, '<br/>')
        };
        const enterInput = function (e) {
            if (e.keyCode === 13 && e.ctrlKey) {
                state.inputText += "\n"; //换行
            } else if (e.keyCode === 13) {
                console.log('发送消息:' + formatInput(e.target.value));
                sendMessage();
                state.inputText = '';
                e.preventDefault();//禁止回车的默认换行
            }
        };
        const connectClose =function(){
            websocket.close()
        };
        //关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        onUnmounted(() => {
            if(websocket){
                websocket.close()
            }

        });
        return {
            ...toRefs(state),
            connectWebSocket,
            sendMessage,
            connectService,
            enterInput,
            connectClose
        }
    }
});
</script>

<style scoped>
.main {
    position: relative;
    top: 20px;
}

.message {
    position: relative;
    overflow: auto;
    top: 20px;
    width: 100%;
    height: 40%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    padding: 5px;
}
</style>