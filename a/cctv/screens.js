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
/***/ (function(module, exports, __webpack_require__) {

	var screenfull = __webpack_require__(2);
	
	console.log('window.CCTV.add(sources) // hls source address');
	
	(function ($) {
	    var nav = $('.nav');
	    var navList = nav.find('.nav-cinema-device-list');
	    var cinemas, cinemaIndex;
	
	    nav.on('click', '.cinema', function (e) {
	        e.preventDefault();
	        var wrap = $(this).parent();
	        if (wrap.hasClass('screens-opened')) {
	            wrap.removeClass('screens-opened');
	        } else {
	            wrap.addClass('screens-opened');
	        }
	        return false;
	    });
	
	    nav.find('.nav-cinema-device-filter > input').on('input', function () {
	        var el = $(this);
	        var search = el.val().trim();
	
	        if (search) {
	            cinemaIndex.forEach(function (word, i) {
	                if ((new RegExp(search)).test(word)) {
	                    cinemas.eq(i).show();
	                } else {
	                    cinemas.eq(i).hide();
	                }
	            });
	        } else {
	            cinemas.show();
	        }
	    });
	
	    navList.on('click', '.screen', function (e) {
	        e.preventDefault();
	        var el = $(this);
	
	        function success(sources) {
	            el.attr('sources', sources);
	            window.CCTV.add(sources);
	        }
	
	        if (el.attr('sources')) {
	            success(el.attr('sources'));
	        } else {
	            getDeviceRtpInfo(el.data(), success);
	        }
	        return false;
	    });
	
	    function getAllCinemaDevice() {
	        $.get(navList.attr('source-list')).done(function (ret) {
	            navList.html(ret);
	        }).fail(function () {
	            navList.html('');
	        }).always(function () {
	            createIndex();
	        });
	    }
	
	    function createIndex() {
	        cinemas = nav.find('.nav-cinema-device-list > div');
	        cinemaIndex = [];
	        cinemas.each(function () {
	            cinemaIndex.push($(this).attr('filter'));
	        });
	    }
	
	    function getDeviceRtpInfo(params, cb) {
	        $.get(navList.attr('source-rtp'), params).done(function (ret) {
	            if (ret.code === 0 && ret.response.hasOwnProperty('hls')) {
	                cb(ret.response.hls)
	                return;
	            }
	
	            console.log(ret.msg, 'warning');
	        }).fail(function () {
	            console.log('请求失败，请稍后重试', 'warning');
	        });
	    }
	
	    window.CCTV.on('added', function (screen) {
	        var item = navList.find('[sources="' + screen.sources + '"]');
	        if (item.length) {
	            item.addClass('playing');
	        }
	    });
	
	    window.CCTV.on('remove', function (screen) {
	        var item = navList.find('[sources="' + screen.sources + '"]');
	        if (item.length) {
	            item.removeClass('playing');
	        }
	    });
	
	    $('#button_screen_player_horizontal').on('click', function () {
	        window.CCTV.resetMatrix([[1, 1], [2, 2], [3, 3], [4, 4]]);
	    });
	
	    $('#button_screen_player_vertical').on('click', function () {
	        window.CCTV.resetMatrix([[1, 2], [2, 4], [3, 6]]);
	    });
	
	    $('#button_nav_switcher').on('click', function () {
	        $('.main').toggleClass('nav-opened');
	        window.CCTV.resizeScreens();
	    });
	
	    $('#button_full_screen_switcher').on('click', function () {
	        if (screenfull.enabled) {
	            screenfull.request(document.documentElement);
	        }
	    });
	
	    screenfull.on('change', function () {
	        if (screenfull.isFullscreen) {
	            $('#button_full_screen_switcher').hide();
	        } else {
	            $('#button_full_screen_switcher').show();
	        }
	    });
	
	    var resizeDelay;
	    $(window).on('resize', function () {
	        if (resizeDelay) {
	            clearTimeout(resizeDelay);
	        }
	        resizeDelay = setTimeout(function () {
	            var x = $(this).width();
	            var y = $(this).height();
	            if (x >= y) {
	                // 横屏
	                window.CCTV.resetMatrix([[1, 1], [2, 2], [3, 3], [4, 4]]);
	            } else {
	                // 竖屏
	                window.CCTV.resetMatrix([[1, 2], [2, 4], [3, 6]]);
	            }
	
	            clearTimeout(resizeDelay);
	        }, 500);
	    });
	
	    $(document).ready(function () {
	        getAllCinemaDevice();
	    });
	
	    document.oncontextmenu = function () {
	        return false
	    }
	})(jQuery);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/*!
	* screenfull
	* v3.3.3 - 2018-09-04
	* (c) Sindre Sorhus; MIT License
	*/
	(function () {
		'use strict';
	
		var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
		var isCommonjs = typeof module !== 'undefined' && module.exports;
		var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;
	
		var fn = (function () {
			var val;
	
			var fnMap = [
				[
					'requestFullscreen',
					'exitFullscreen',
					'fullscreenElement',
					'fullscreenEnabled',
					'fullscreenchange',
					'fullscreenerror'
				],
				// New WebKit
				[
					'webkitRequestFullscreen',
					'webkitExitFullscreen',
					'webkitFullscreenElement',
					'webkitFullscreenEnabled',
					'webkitfullscreenchange',
					'webkitfullscreenerror'
	
				],
				// Old WebKit (Safari 5.1)
				[
					'webkitRequestFullScreen',
					'webkitCancelFullScreen',
					'webkitCurrentFullScreenElement',
					'webkitCancelFullScreen',
					'webkitfullscreenchange',
					'webkitfullscreenerror'
	
				],
				[
					'mozRequestFullScreen',
					'mozCancelFullScreen',
					'mozFullScreenElement',
					'mozFullScreenEnabled',
					'mozfullscreenchange',
					'mozfullscreenerror'
				],
				[
					'msRequestFullscreen',
					'msExitFullscreen',
					'msFullscreenElement',
					'msFullscreenEnabled',
					'MSFullscreenChange',
					'MSFullscreenError'
				]
			];
	
			var i = 0;
			var l = fnMap.length;
			var ret = {};
	
			for (; i < l; i++) {
				val = fnMap[i];
				if (val && val[1] in document) {
					for (i = 0; i < val.length; i++) {
						ret[fnMap[0][i]] = val[i];
					}
					return ret;
				}
			}
	
			return false;
		})();
	
		var eventNameMap = {
			change: fn.fullscreenchange,
			error: fn.fullscreenerror
		};
	
		var screenfull = {
			request: function (elem) {
				var request = fn.requestFullscreen;
	
				elem = elem || document.documentElement;
	
				// Work around Safari 5.1 bug: reports support for
				// keyboard in fullscreen even though it doesn't.
				// Browser sniffing, since the alternative with
				// setTimeout is even worse.
				if (/ Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent)) {
					elem[request]();
				} else {
					elem[request](keyboardAllowed ? Element.ALLOW_KEYBOARD_INPUT : {});
				}
			},
			exit: function () {
				document[fn.exitFullscreen]();
			},
			toggle: function (elem) {
				if (this.isFullscreen) {
					this.exit();
				} else {
					this.request(elem);
				}
			},
			onchange: function (callback) {
				this.on('change', callback);
			},
			onerror: function (callback) {
				this.on('error', callback);
			},
			on: function (event, callback) {
				var eventName = eventNameMap[event];
				if (eventName) {
					document.addEventListener(eventName, callback, false);
				}
			},
			off: function (event, callback) {
				var eventName = eventNameMap[event];
				if (eventName) {
					document.removeEventListener(eventName, callback, false);
				}
			},
			raw: fn
		};
	
		if (!fn) {
			if (isCommonjs) {
				module.exports = false;
			} else {
				window.screenfull = false;
			}
	
			return;
		}
	
		Object.defineProperties(screenfull, {
			isFullscreen: {
				get: function () {
					return Boolean(document[fn.fullscreenElement]);
				}
			},
			element: {
				enumerable: true,
				get: function () {
					return document[fn.fullscreenElement];
				}
			},
			enabled: {
				enumerable: true,
				get: function () {
					// Coerce to boolean in case of old WebKit
					return Boolean(document[fn.fullscreenEnabled]);
				}
			}
		});
	
		if (isCommonjs) {
			module.exports = screenfull;
		} else {
			window.screenfull = screenfull;
		}
	})();


/***/ })
/******/ ]);
//# sourceMappingURL=screens.js.map