var content = document.querySelector("body");

if ("WebSocket" in window) {
    var node = document.createElement("p");
    node.innerText = "您的浏览器支持 WebSocket!";
    content.appendChild(node);

    // 打开一个 web socket
    var client = new WebSocket("ws://123.57.43.13:20001");

    client.onopen = function () {
        // Web Socket 已连接上，使用 send() 方法发送数据
        client.send("发送数据");
        var node = document.createElement("p");
        node.innerText = "数据发送中...";
        content.appendChild(node);
    };

    client.onmessage = function (evt) {
        console.log(evt);
        var received_msg = evt.data;
        var node = document.createElement("p");
        node.innerText = received_msg;
        content.appendChild(node);
    };

//        ws.onclose = function () {
//          // 关闭 websocket
//          alert("连接已关闭...");
//        };
}

else {
    // 浏览器不支持 WebSocket
    var node = document.createElement("p");
    node.innerText = "您的浏览器不支持 WebSocket!";
    content.appendChild(node);
}