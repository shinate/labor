/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

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

/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map