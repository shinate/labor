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

	var ZERO_BASE = [0xF1, 0x52, 0x49, 0xE9, 0xAE, 0xF1, 0x90, 0xBB];
	var MASK = [4, 1, 3, 7, 0, 5, 2, 6];
	
	function encode(value) {
	    if (value > -0x80000000 && value < 0xFFFFFFFF) {
	        value = parseInt(value) & 0xFFFFFFFF;
	        return ZERO_BASE.map(function (_B_, i) {
	            var mask = MASK[i] * 4;
	            return ('0' + (((((0xF << mask) & value) >> mask) + _B_) & 0xFF).toString(16).toUpperCase()).slice(-2);
	        }).join(' ');
	    }
	
	    return null;
	}
	
	$('#BTN_ENCODE').on('click', function () {
	    var value = $('#INT').val().trim();
	    if (value !== '') {
	        var res = encode(value);
	        if (res != null) {
	            $('#HEX').val(res);
	            updateEqual(value);
	            return false;
	        }
	    }
	    $('#HEX').val('');
	    updateEqual(null);
	    return false;
	});
	
	function decode(hex) {
	    var hex = hex.replace(/[\x20]/g, '');
	    if (hex.length >= 16) {
	        return eval(ZERO_BASE.map(function (_B_, i) {
	            return ((parseInt(hex.charAt(i * 2) + hex.charAt(i * 2 + 1), 16) - _B_) & 0xF) << (MASK[i] * 4);
	        }).join('+'));
	    }
	    return null;
	}
	
	$('#BTN_DECODE').on('click', function () {
	    var value = $('#HEX').val().trim();
	    if (value !== '') {
	        var res = decode(value)
	        if (res != null) {
	            $('#INT').val(res);
	            updateEqual(res);
	            return false;
	        }
	    }
	    $('#INT').val('');
	    updateEqual(null);
	    return false;
	});
	
	var equal = $('<div class="input-group-append equal"><span class="input-group-text"></span></div>')
	
	function updateEqual(value) {
	    if (value == null) {
	        equal.remove();
	    } else {
	        equal.find('> span').html('<span>' + [
	                '<i class="int">' + (new Int32Array([value])).toString() + '</i>',
	                '<i class="uint">' + (new Uint32Array([value])).toString() + '</i>'
	            ].join('<br>') + '</span>');
	        $('#INT').after(equal);
	    }
	}

/***/ })
/******/ ]);
//# sourceMappingURL=character-attribute.js.map