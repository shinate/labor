// var WSService = require('./lib/WSService').default;
var ETMSClient = require('./ETMSClient').default;

var ADP = new ETMSClient({
    url: "ws://123.57.43.13:20001/web_socket/ad_manage"
});

console.log(ADP);

ADP.rev(commandRoute);

function commandRoute(data) {
    // 解析协议、内容
    pool('[' + (new Date()).toTimeString().slice(0, 8) + '] REV ' + data);
}

var messagePool = document.querySelector('#message');
function pool(message) {
    var p = document.createElement('p');
    p.innerText = message;
    messagePool.appendChild(p);

    messagePool.scrollTop = p.offsetTop;
}

document.querySelector('#send').addEventListener('click', function (e) {
    e.preventDefault();
    var m = Math.random().toString(36).substring(2);
    ADP.send(m);
    pool('[' + (new Date()).toTimeString().slice(0, 8) + '] SED ' + m);
}, false);