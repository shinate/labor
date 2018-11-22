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

	module.exports = __webpack_require__(2);


/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	// var videojs = require('video.js');
	var collect = __webpack_require__(3);
	
	// require('videojs-contrib-hls.js');
	
	module.exports = window.CCTV = (function ($) {
	
	    var MATRIX_DEFAULT = [[1, 1], [2, 2], [3, 3], [4, 4]];
	
	    /**
	     * @type {string}
	     * contain: 等比
	     * fill: 充满
	     */
	    var SCREEN_PLAYER_SIZE = 'fill';
	
	    /**
	     * @type {collect}
	     */
	    var MATRIX_SOURCES = collect();
	
	    /**
	     * @type {collect}
	     */
	    var MATRIX = collect(MATRIX_DEFAULT);
	
	    /**
	     * 当前矩阵指针
	     * @type {number}
	     */
	    var CURRENT_MATRIX = [0, 0];
	
	    /**
	     * 当前播放器最大量
	     * @type {number}
	     */
	    var PLAYER_NUM = 0;
	
	    /**
	     * 回调事件容器
	     * @type {Object}
	     */
	    var CALLBACKS = {};
	
	    var styleNode = $('<style></style>').appendTo($(document.head));
	
	    var matrixNode = $('.matrix');
	
	    function CCTV(options) {
	        this.setOption(options || {});
	
	        this.init();
	        // console.log(fitMatrix(18));
	        // console.log(uniqueID());
	        // console.log(getFreeScreen());
	    }
	
	    var CP = CCTV.prototype;
	
	    CP.init = function () {
	        var that = this;
	
	        createMatrixStyles();
	
	        fillMatrixSources();
	
	        $(window).on('resize', this.resizeScreens.bind(this));
	
	        matrixNode
	            .on('click', '.reload', function () {
	                that.reload($(this).parent().find(':eq(0)').attr('id'));
	            })
	            .on('click', '.remove', function () {
	                that.remove($(this).parent().find(':eq(0)').attr('id'));
	            });
	    };
	
	    CP.switchPlayerSize = function switchPlayerSize(type) {
	        if (['fill', 'contain'].indexOf(type) > -1) {
	            SCREEN_PLAYER_SIZE = type;
	        } else {
	            SCREEN_PLAYER_SIZE = 'contain';
	        }
	        this.resizeScreens();
	    };
	
	    CP.addToScreen = function (sources, screen) {
	        if (!sources || MATRIX_SOURCES.where('sources', sources).count()) {
	            return;
	        }
	        this.removeFromScreen(screen);
	        screen.sources = sources;
	        screen.ID = uniqueID();
	        var dom = $('' +
	            '<video id="' + screen.ID + '" class="video-js" autoplay>' +
	            '<source src="' + screen.sources + '" type="application/x-mpegURL">' +
	            '</video>');
	        screen.container.prepend(dom);
	        screen.container.addClass('screen-actived');
	        screen.player = videojs(dom.get(0));
	
	        screen.player.one('play', function () {
	            screen.originalWidth = $(this.el_).width();
	            screen.originalHeight = $(this.el_).height();
	            fitScreen(screen);
	        });
	
	        this.reflexMatrix();
	
	        this.dispatch('added', [screen]);
	    };
	
	    CP.addToFreeScreen = function addToFreeScreen(sources) {
	        this.addToScreen(sources, getFreeScreen());
	    };
	
	    CP.addToScreenNo = function (sources, screenNo) {
	        this.addToScreen(sources, getScreenByNo(screenNo));
	    };
	
	    CP.add = CP.addToFreeScreen;
	
	    CP.removeFromScreen = function (screen) {
	        if (screen.player == null) {
	            return;
	        }
	
	        this.dispatch('remove', [screen]);
	
	        screen.container.removeClass('screen-actived');
	        screen.player.dispose();
	        screen.player = null;
	        screen.sources = null;
	        screen.ID = null;
	        this.reflexMatrix();
	    };
	
	    CP.removeFromScreenByNo = function (screenNo) {
	        this.removeFromScreen(getScreenByNo(screenNo));
	    };
	
	    CP.remove = function remove(idOrSource) {
	        this.removeFromScreen(getScreenByIdOrSource(idOrSource));
	    };
	
	    CP.reload = function (id, sources) {
	        var SCREEN = getScreenByIdOrSource(id);
	
	        if (SCREEN == null) {
	            return;
	        }
	
	        if (sources != null) {
	            SCREEN.sources = sources;
	        }
	
	        SCREEN.player.pause();
	        SCREEN.player.src({type: 'application/x-mpegURL', src: SCREEN.sources});
	        SCREEN.player.load();
	        SCREEN.player.play();
	
	        SCREEN.player.one('play', function () {
	            screen.originalWidth = $(this.el_).width();
	            screen.originalHeight = $(this.el_).height();
	            fitScreen(SCREEN);
	        });
	    };
	
	    CP.clear = function clear() {
	
	    };
	
	    CP.reMatrix = function reMatrix(num) {
	        if (num !== 0) {
	            var index = MATRIX.all().indexOf(CURRENT_MATRIX);
	            var max = MATRIX.count() - 1;
	            if (num > 0) {
	                if (index === -1) {
	                    index = -1;
	                } else if (index === max) {
	                    index = max - 1;
	                }
	                CURRENT_MATRIX = MATRIX.get(index + 1);
	            } else if (num < 0) {
	                if (index < 1) {
	                    CURRENT_MATRIX = [0, 0];
	                } else {
	                    CURRENT_MATRIX = MATRIX.get(index - 1);
	                    var min = fitMatrix(PLAYER_NUM);
	                    if (CURRENT_MATRIX[0] * CURRENT_MATRIX[1] < min[0] * min[1]) {
	                        CURRENT_MATRIX = min;
	                    }
	                }
	            }
	            matrixNode.attr('class', 'matrix matrix-' + CURRENT_MATRIX.join('-'));
	            this.resizeScreens();
	        }
	    };
	
	    CP.reflexMatrix = function reflexMatrix() {
	        PLAYER_NUM = getLastPlayerPosition() + 1;
	        CURRENT_MATRIX = fitMatrix(PLAYER_NUM);
	        // console.log(PLAYER_NUM, CURRENT_MATRIX);
	        matrixNode.attr('class', 'matrix matrix-' + CURRENT_MATRIX.join('-'));
	        this.resizeScreens();
	    };
	
	    CP.resizeScreens = function reSizeScreens() {
	        if (PLAYER_NUM > 0 && CURRENT_MATRIX[0] * CURRENT_MATRIX[1] > 0) {
	            var ruleSizeDOM = matrixNode.find('> article:eq(0)');
	            var width = ruleSizeDOM.width(), height = ruleSizeDOM.height();
	            MATRIX_SOURCES.each(function (item) {
	                fitScreen(item, width, height);
	            });
	        }
	    };
	
	    CP.on = function on(e, cb) {
	        if (typeof cb === 'function') {
	            if (!CALLBACKS.hasOwnProperty(e)) {
	                CALLBACKS[e] = [cb];
	            } else {
	                CALLBACKS[e].push(cb);
	            }
	        }
	    };
	
	    CP.dispatch = function dispatch(e, params, context) {
	        if (CALLBACKS.hasOwnProperty(e) && CALLBACKS[e].length > 0) {
	            CALLBACKS[e].forEach((function (cb) {
	                cb.apply(context || this, params);
	            }).bind(this))
	        }
	    };
	
	    CP.setOption = function setOption(options) {
	        if (options.hasOwnProperty('matrix') && $.isArray(options.matrix)) MATRIX = collect(options.matrix);
	    };
	
	    CP.resetMatrix = function resetMatrix(matrix) {
	        if ($.isArray(matrix) && matrix.length > 0) {
	            MATRIX = collect(matrix);
	            createMatrixStyles();
	            fillMatrixSources();
	            this.reflexMatrix();
	        }
	    };
	
	    function fitScreen(screen, width, height) {
	        if (screen.player == null) {
	            return;
	        }
	        if (screen.originalWidth == null || screen.originalHeight == null) {
	            return;
	        }
	
	        var el = $(screen.player.el_);
	
	        if (width == null || height == null) {
	            var screenEl = screen.container;
	            width = screenEl.width();
	            height = screenEl.height();
	        }
	
	        switch (SCREEN_PLAYER_SIZE) {
	            case 'fill':
	                var wScale = width / screen.originalWidth; // 宽度比
	                var hScale = height / screen.originalHeight; // 高度比
	                el.css({
	                    width: screen.originalWidth,
	                    height: screen.originalHeight,
	                    transform: 'scale3d(' + wScale + ',' + hScale + ',1)',
	                    'transform-origin': '0 0',
	                });
	                break;
	            case 'contain':
	            default:
	                el.css({width: width, height: height, transform: '', 'transform-origin': ''})
	                break;
	        }
	    }
	
	    function createMatrixStyles() {
	        var styleContent = [];
	        MATRIX.map(function (item) {
	            var num = Math.abs(item[0] * item[1]);
	            var stylePrefix = '.matrix.matrix-' + item[0] + '-' + item[1] + ' > article:nth-child';
	            if (num === 0) {
	
	            } else if (num === 1) {
	                styleContent.push(stylePrefix + '(1) {display: initial;height:100%;flex:0 0 100%;border:0 none}');
	            } else {
	                styleContent.push(stylePrefix + '(-n+' + num + ') {display:initial;height:' + (100 / item[1]) + '%;flex: 0 0 ' + (100 / item[0]) + '%}');
	                styleContent.push(stylePrefix + '(' + item[0] + 'n+1) {border-left-width: 0}');
	                styleContent.push(stylePrefix + '(-n+' + item[0] + ') {border-top-width: 0}');
	            }
	        });
	
	        styleNode.text(styleContent.join('\n'));
	    }
	
	    function getScreenByNo(no) {
	        return MATRIX_SOURCES.get(no);
	    }
	
	    function getScreenByIdOrSource(idOrSource) {
	        var SCREEN = null;
	        var s = MATRIX_SOURCES.where('ID', idOrSource);
	        if (s.count()) {
	            SCREEN = s.first();
	        } else {
	            s = MATRIX_SOURCES.where('sources', idOrSource);
	            if (s.count()) {
	                SCREEN = s.first();
	            }
	        }
	
	        return SCREEN;
	    }
	
	    function getFreeScreen() {
	        return MATRIX_SOURCES.where('sources', null).first();
	    }
	
	    function uniqueID() {
	        return 'screen_' + Math.random().toString(36).substr(2);
	    }
	
	    function getPlayerNUM() {
	        return MATRIX_SOURCES.filter(function (item) {
	            return item.player !== null;
	        }).count()
	    }
	
	    function getLastPlayerPosition() {
	        var index = -1;
	        MATRIX_SOURCES.last(function (item, i) {
	            if (item.player !== null) {
	                index = i;
	                return true;
	            }
	        });
	
	        return index;
	    }
	
	    function fitMatrix(len) {
	        return len > 0 ? (MATRIX.first(function (item) {
	            return item[0] * item[1] >= len;
	        }) || MATRIX.last()) : [0, 0];
	    }
	
	    function fillMatrixSources() {
	        var last = MATRIX.last();
	        var fillNum = last[0] * last[1] - MATRIX_SOURCES.count();
	
	        for (var i = 0; i < fillNum; i++) {
	            var article = $('<article class="screen"><button type="button" class="reload fa fa-refresh"></button><button type="button" class="remove fa fa-times"></button></article>');
	            matrixNode.append(article);
	            MATRIX_SOURCES.push({
	                ID: null,
	                container: article,
	                sources: null,
	                player: null,
	                originalWidth: null,
	                originalHeight: null
	            });
	        }
	    }
	
	    return new CCTV;
	
	})(jQuery);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	function Collection(collection) {
	  this.items = collection || [];
	}
	
	var SymbolIterator = __webpack_require__(4);
	
	if (typeof Symbol !== 'undefined') {
	  Collection.prototype[Symbol.iterator] = SymbolIterator;
	}
	
	Collection.prototype.all = __webpack_require__(5);
	Collection.prototype.average = __webpack_require__(6);
	Collection.prototype.avg = __webpack_require__(6);
	Collection.prototype.chunk = __webpack_require__(7);
	Collection.prototype.collapse = __webpack_require__(8);
	Collection.prototype.combine = __webpack_require__(9);
	Collection.prototype.concat = __webpack_require__(10);
	Collection.prototype.contains = __webpack_require__(11);
	Collection.prototype.count = __webpack_require__(13);
	Collection.prototype.crossJoin = __webpack_require__(14);
	Collection.prototype.dd = __webpack_require__(15);
	Collection.prototype.diff = __webpack_require__(17);
	Collection.prototype.diffAssoc = __webpack_require__(18);
	Collection.prototype.diffKeys = __webpack_require__(19);
	Collection.prototype.dump = __webpack_require__(20);
	Collection.prototype.each = __webpack_require__(21);
	Collection.prototype.eachSpread = __webpack_require__(22);
	Collection.prototype.every = __webpack_require__(23);
	Collection.prototype.except = __webpack_require__(24);
	Collection.prototype.filter = __webpack_require__(26);
	Collection.prototype.first = __webpack_require__(27);
	Collection.prototype.firstWhere = __webpack_require__(28);
	Collection.prototype.flatMap = __webpack_require__(29);
	Collection.prototype.flatten = __webpack_require__(30);
	Collection.prototype.flip = __webpack_require__(31);
	Collection.prototype.forPage = __webpack_require__(32);
	Collection.prototype.forget = __webpack_require__(33);
	Collection.prototype.get = __webpack_require__(34);
	Collection.prototype.groupBy = __webpack_require__(35);
	Collection.prototype.has = __webpack_require__(36);
	Collection.prototype.implode = __webpack_require__(37);
	Collection.prototype.intersect = __webpack_require__(38);
	Collection.prototype.intersectByKeys = __webpack_require__(39);
	Collection.prototype.isEmpty = __webpack_require__(40);
	Collection.prototype.isNotEmpty = __webpack_require__(41);
	Collection.prototype.keyBy = __webpack_require__(42);
	Collection.prototype.keys = __webpack_require__(43);
	Collection.prototype.last = __webpack_require__(44);
	Collection.prototype.macro = __webpack_require__(45);
	Collection.prototype.map = __webpack_require__(46);
	Collection.prototype.mapSpread = __webpack_require__(47);
	Collection.prototype.mapToDictionary = __webpack_require__(48);
	Collection.prototype.mapInto = __webpack_require__(49);
	Collection.prototype.mapToGroups = __webpack_require__(50);
	Collection.prototype.mapWithKeys = __webpack_require__(51);
	Collection.prototype.max = __webpack_require__(52);
	Collection.prototype.median = __webpack_require__(53);
	Collection.prototype.merge = __webpack_require__(54);
	Collection.prototype.min = __webpack_require__(55);
	Collection.prototype.mode = __webpack_require__(56);
	Collection.prototype.nth = __webpack_require__(57);
	Collection.prototype.only = __webpack_require__(58);
	Collection.prototype.pad = __webpack_require__(59);
	Collection.prototype.partition = __webpack_require__(61);
	Collection.prototype.pipe = __webpack_require__(62);
	Collection.prototype.pluck = __webpack_require__(63);
	Collection.prototype.pop = __webpack_require__(65);
	Collection.prototype.prepend = __webpack_require__(66);
	Collection.prototype.pull = __webpack_require__(67);
	Collection.prototype.push = __webpack_require__(68);
	Collection.prototype.put = __webpack_require__(69);
	Collection.prototype.random = __webpack_require__(70);
	Collection.prototype.reduce = __webpack_require__(71);
	Collection.prototype.reject = __webpack_require__(72);
	Collection.prototype.reverse = __webpack_require__(73);
	Collection.prototype.search = __webpack_require__(74);
	Collection.prototype.shift = __webpack_require__(75);
	Collection.prototype.shuffle = __webpack_require__(76);
	Collection.prototype.slice = __webpack_require__(77);
	Collection.prototype.sort = __webpack_require__(78);
	Collection.prototype.sortBy = __webpack_require__(79);
	Collection.prototype.sortByDesc = __webpack_require__(80);
	Collection.prototype.splice = __webpack_require__(81);
	Collection.prototype.split = __webpack_require__(82);
	Collection.prototype.sum = __webpack_require__(83);
	Collection.prototype.take = __webpack_require__(84);
	Collection.prototype.tap = __webpack_require__(85);
	Collection.prototype.times = __webpack_require__(86);
	Collection.prototype.toArray = __webpack_require__(87);
	Collection.prototype.toJson = __webpack_require__(88);
	Collection.prototype.transform = __webpack_require__(89);
	Collection.prototype.unless = __webpack_require__(90);
	Collection.prototype.union = __webpack_require__(91);
	Collection.prototype.unique = __webpack_require__(92);
	Collection.prototype.unwrap = __webpack_require__(93);
	Collection.prototype.values = __webpack_require__(94);
	Collection.prototype.when = __webpack_require__(95);
	Collection.prototype.where = __webpack_require__(96);
	Collection.prototype.whereIn = __webpack_require__(97);
	Collection.prototype.whereNotIn = __webpack_require__(98);
	Collection.prototype.wrap = __webpack_require__(99);
	Collection.prototype.zip = __webpack_require__(100);
	
	var collect = function collect(collection) {
	  return new Collection(collection);
	};
	
	module.exports = collect;
	module.exports.default = collect;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function SymbolIterator() {
	  var _this = this;
	
	  var index = -1;
	
	  return {
	    next: function next() {
	      index += 1;
	
	      return {
	        value: _this.items[index],
	        done: index >= _this.items.length
	      };
	    }
	  };
	};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function all() {
	  return this.items;
	};

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function average(key) {
	  if (key === undefined) {
	    return this.sum() / this.items.length;
	  }
	
	  return new this.constructor(this.items).pluck(key).sum() / this.items.length;
	};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function chunk(size) {
	  var _this = this;
	
	  var chunks = [];
	  var index = 0;
	
	  if (Array.isArray(this.items)) {
	    do {
	      var items = this.items.slice(index, index + size);
	      var collection = new this.constructor(items);
	
	      chunks.push(collection);
	      index += size;
	    } while (index < this.items.length);
	  } else if (_typeof(this.items) === 'object') {
	    var keys = Object.keys(this.items);
	
	    var _loop = function _loop() {
	      var keysOfChunk = keys.slice(index, index + size);
	      var collection = new _this.constructor({});
	
	      keysOfChunk.forEach(function (key) {
	        return collection.put(key, _this.items[key]);
	      });
	
	      chunks.push(collection);
	      index += size;
	    };
	
	    do {
	      _loop();
	    } while (index < keys.length);
	  } else {
	    chunks.push(new this.constructor([this.items]));
	  }
	
	  return new this.constructor(chunks);
	};

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	module.exports = function collapse() {
	  var _ref;
	
	  return new this.constructor((_ref = []).concat.apply(_ref, _toConsumableArray(this.items)));
	};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function combine(array) {
	  var _this = this;
	
	  var values = array;
	
	  if (values instanceof this.constructor) {
	    values = array.all();
	  }
	
	  var collection = {};
	
	  if (Array.isArray(this.items) && Array.isArray(values)) {
	    this.items.forEach(function (key, iterator) {
	      collection[key] = values[iterator];
	    });
	  } else if (_typeof(this.items) === 'object' && (typeof values === 'undefined' ? 'undefined' : _typeof(values)) === 'object') {
	    Object.keys(this.items).forEach(function (key, index) {
	      collection[_this.items[key]] = values[Object.keys(values)[index]];
	    });
	  } else if (Array.isArray(this.items)) {
	    collection[this.items[0]] = values;
	  } else if (typeof this.items === 'string' && Array.isArray(values)) {
	    collection[this.items] = values[0];
	  } else if (typeof this.items === 'string') {
	    collection[this.items] = values;
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function concat(collectionOrArrayOrObject) {
	  var _this = this;
	
	  var list = collectionOrArrayOrObject;
	
	  if (collectionOrArrayOrObject instanceof this.constructor) {
	    list = collectionOrArrayOrObject.all();
	  } else if ((typeof collectionOrArrayOrObject === 'undefined' ? 'undefined' : _typeof(collectionOrArrayOrObject)) === 'object') {
	    list = [];
	    Object.keys(collectionOrArrayOrObject).forEach(function (property) {
	      list.push(collectionOrArrayOrObject[property]);
	    });
	  }
	
	  list.forEach(function (item) {
	    if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
	      Object.keys(item).forEach(function (key) {
	        return _this.items.push(item[key]);
	      });
	    } else {
	      _this.items.push(item);
	    }
	  });
	
	  return this;
	};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var values = __webpack_require__(12);
	
	module.exports = function contains(key, value) {
	  if (value !== undefined) {
	    if (Array.isArray(this.items)) {
	      return this.items.filter(function (items) {
	        return items[key] !== undefined && items[key] === value;
	      }).length > 0;
	    }
	
	    return this.items[key] !== undefined && this.items[key] === value;
	  }
	
	  if (typeof key === 'function') {
	    return this.items.filter(function (item, index) {
	      return key(item, index);
	    }).length > 0;
	  }
	
	  if (Array.isArray(this.items)) {
	    return this.items.indexOf(key) !== -1;
	  }
	
	  var keysAndValues = values(this.items);
	  keysAndValues.push.apply(keysAndValues, _toConsumableArray(Object.keys(this.items)));
	
	  return keysAndValues.indexOf(key) !== -1;
	};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Values helper
	 *
	 * Retrieve values from [this.items] when it is an array, object or Collection
	 *
	 * @returns {*}
	 * @param items
	 */
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	module.exports = function values(items) {
	  var valuesArray = [];
	
	  if (Array.isArray(items)) {
	    valuesArray.push.apply(valuesArray, _toConsumableArray(items));
	  } else if (items.constructor.name === 'Collection') {
	    valuesArray.push.apply(valuesArray, _toConsumableArray(items.all()));
	  } else {
	    Object.keys(items).forEach(function (prop) {
	      return valuesArray.push(items[prop]);
	    });
	  }
	
	  return valuesArray;
	};

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function count() {
	  var arrayLength = 0;
	
	  if (Array.isArray(this.items)) {
	    arrayLength = this.items.length;
	  }
	
	  return Math.max(Object.keys(this.items).length, arrayLength);
	};

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function crossJoin() {
	  function join(collection, constructor, args) {
	    var current = args[0];
	
	    if (current instanceof constructor) {
	      current = current.all();
	    }
	
	    var rest = args.slice(1);
	    var last = !rest.length;
	    var result = [];
	
	    for (var i = 0; i < current.length; i += 1) {
	      var collectionCopy = collection.slice();
	      collectionCopy.push(current[i]);
	
	      if (last) {
	        result.push(collectionCopy);
	      } else {
	        result = result.concat(join(collectionCopy, constructor, rest));
	      }
	    }
	
	    return result;
	  }
	
	  for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
	    values[_key] = arguments[_key];
	  }
	
	  return new this.constructor(join([], this.constructor, [].concat([this.items], values)));
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	module.exports = function dd() {
	  this.dump();
	
	  if (typeof process !== 'undefined') {
	    process.exit(1);
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(16)))

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function diff(values) {
	  var valuesToDiff = void 0;
	
	  if (values instanceof this.constructor) {
	    valuesToDiff = values.all();
	  } else {
	    valuesToDiff = values;
	  }
	
	  var collection = this.items.filter(function (item) {
	    return valuesToDiff.indexOf(item) === -1;
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function diffAssoc(values) {
	  var _this = this;
	
	  var diffValues = values;
	
	  if (values instanceof this.constructor) {
	    diffValues = values.all();
	  }
	
	  var collection = {};
	
	  Object.keys(this.items).forEach(function (key) {
	    if (diffValues[key] === undefined || diffValues[key] !== _this.items[key]) {
	      collection[key] = _this.items[key];
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function diffKeys(object) {
	  var objectToDiff = void 0;
	
	  if (object instanceof this.constructor) {
	    objectToDiff = object.all();
	  } else {
	    objectToDiff = object;
	  }
	
	  var objectKeys = Object.keys(objectToDiff);
	
	  var remainingKeys = Object.keys(this.items).filter(function (item) {
	    return objectKeys.indexOf(item) === -1;
	  });
	
	  return new this.constructor(this.items).only(remainingKeys);
	};

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function dump() {
	  // eslint-disable-next-line
	  console.log(this);
	
	  return this;
	};

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function each(fn) {
	  var _this = this;
	
	  if (Array.isArray(this.items)) {
	    this.items.forEach(fn);
	  } else {
	    Object.keys(this.items).forEach(function (key) {
	      fn(_this.items[key], key, _this.items);
	    });
	  }
	
	  return this;
	};

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	module.exports = function eachSpread(fn) {
	  this.each(function (values, key) {
	    fn.apply(undefined, _toConsumableArray(values).concat([key]));
	  });
	
	  return this;
	};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var values = __webpack_require__(12);
	
	module.exports = function every(fn) {
	  var items = values(this.items);
	
	  return items.map(function (item, index) {
	    return fn(item, index);
	  }).indexOf(false) === -1;
	};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var variadic = __webpack_require__(25);
	
	module.exports = function except() {
	  var _this = this;
	
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  var properties = variadic(args);
	
	  if (Array.isArray(this.items)) {
	    var _collection = this.items.filter(function (item) {
	      return properties.indexOf(item) === -1;
	    });
	
	    return new this.constructor(_collection);
	  }
	
	  var collection = {};
	
	  Object.keys(this.items).forEach(function (property) {
	    if (properties.indexOf(property) === -1) {
	      collection[property] = _this.items[property];
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Variadic helper function
	 *
	 * @param args
	 * @returns {*}
	 */
	
	module.exports = function variadic(args) {
	  if (Array.isArray(args[0])) {
	    return args[0];
	  }
	
	  return args;
	};

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	function falsyValue(item) {
	  if (Array.isArray(item)) {
	    if (item.length) {
	      return false;
	    }
	  } else if (item !== undefined && item !== null && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
	    if (Object.keys(item).length) {
	      return false;
	    }
	  } else if (item) {
	    return false;
	  }
	
	  return true;
	}
	
	function filterObject(func, items) {
	  var result = {};
	  Object.keys(items).forEach(function (key) {
	    if (func) {
	      if (func(items[key], key)) {
	        result[key] = items[key];
	      }
	    } else if (!falsyValue(items[key])) {
	      result[key] = items[key];
	    }
	  });
	
	  return result;
	}
	
	function filterArray(func, items) {
	  if (func) {
	    return items.filter(func);
	  }
	  var result = [];
	  for (var i = 0; i < items.length; i += 1) {
	    var item = items[i];
	    if (!falsyValue(item)) {
	      result.push(item);
	    }
	  }
	
	  return result;
	}
	
	module.exports = function filter(fn) {
	  var func = fn || false;
	  var filteredItems = null;
	  if (Array.isArray(this.items)) {
	    filteredItems = filterArray(func, this.items);
	  } else {
	    filteredItems = filterObject(func, this.items);
	  }
	
	  return new this.constructor(filteredItems);
	};

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function first(fn, defaultValue) {
	  if (typeof fn === 'function') {
	    for (var i = 0, length = this.items.length; i < length; i += 1) {
	      var item = this.items[i];
	      if (fn(item)) {
	        return item;
	      }
	    }
	
	    if (typeof defaultValue === 'function') {
	      return defaultValue();
	    }
	
	    return defaultValue;
	  }
	
	  if (Array.isArray(this.items) && this.items.length || Object.keys(this.items).length) {
	    if (Array.isArray(this.items)) {
	      return this.items[0];
	    }
	
	    var firstKey = Object.keys(this.items)[0];
	
	    return this.items[firstKey];
	  }
	
	  if (typeof defaultValue === 'function') {
	    return defaultValue();
	  }
	
	  return defaultValue;
	};

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function firstWhere(key, value) {
	  return this.where(key, value).first() || null;
	};

/***/ }),
/* 29 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function flatMap(fn) {
	  var items = [];
	
	  this.items.forEach(function (childObject, index) {
	    var keys = Object.keys(childObject);
	    var values = [];
	
	    keys.forEach(function (prop) {
	      values.push(childObject[prop]);
	    });
	
	    var mapped = fn(values, index);
	
	    var collection = {};
	
	    keys.forEach(function (key, i) {
	      collection[key] = mapped[i];
	    });
	
	    items.push(collection);
	  });
	
	  return new this.constructor(Object.assign.apply(Object, items));
	};

/***/ }),
/* 30 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function flatten(depth) {
	  var flattenDepth = depth || Infinity;
	
	  var fullyFlattened = false;
	  var collection = [];
	
	  var flat = function flat(items) {
	    collection = [];
	
	    if (Array.isArray(items)) {
	      items.forEach(function (item) {
	        if (typeof item === 'string') {
	          collection.push(item);
	        } else if (Array.isArray(item)) {
	          collection = collection.concat(item);
	        } else {
	          Object.keys(item).forEach(function (property) {
	            collection = collection.concat(item[property]);
	          });
	        }
	      });
	    } else {
	      Object.keys(items).forEach(function (property) {
	        if (typeof items[property] === 'string') {
	          collection.push(items[property]);
	        } else if (Array.isArray(items[property])) {
	          collection = collection.concat(items[property]);
	        } else {
	          Object.keys(items).forEach(function (prop) {
	            collection = collection.concat(items[prop]);
	          });
	        }
	      });
	    }
	
	    fullyFlattened = collection.filter(function (item) {
	      return (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object';
	    });
	    fullyFlattened = fullyFlattened.length === 0;
	
	    flattenDepth -= 1;
	  };
	
	  flat(this.items);
	
	  while (!fullyFlattened && flattenDepth > 0) {
	    flat(collection);
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 31 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function flip() {
	  var _this = this;
	
	  var collection = {};
	
	  if (Array.isArray(this.items)) {
	    Object.keys(this.items).forEach(function (key) {
	      collection[_this.items[key]] = Number(key);
	    });
	  } else {
	    Object.keys(this.items).forEach(function (key) {
	      collection[_this.items[key]] = key;
	    });
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 32 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function forPage(page, chunk) {
	  var _this = this;
	
	  var collection = {};
	
	  if (Array.isArray(this.items)) {
	    collection = this.items.slice(page * chunk - chunk, page * chunk);
	  } else {
	    Object.keys(this.items).slice(page * chunk - chunk, page * chunk).forEach(function (key) {
	      collection[key] = _this.items[key];
	    });
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 33 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function forget(key) {
	  if (Array.isArray(this.items)) {
	    this.items.splice(key, 1);
	  } else {
	    delete this.items[key];
	  }
	
	  return this;
	};

/***/ }),
/* 34 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function get(key) {
	  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	
	  if (this.items[key] !== undefined) {
	    return this.items[key];
	  }
	
	  if (typeof defaultValue === 'function') {
	    return defaultValue();
	  }
	
	  if (defaultValue !== null) {
	    return defaultValue;
	  }
	
	  return null;
	};

/***/ }),
/* 35 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function groupBy(key) {
	  var _this = this;
	
	  var collection = {};
	
	  this.items.forEach(function (item, index) {
	    var resolvedKey = void 0;
	
	    if (typeof key === 'function') {
	      resolvedKey = key(item, index);
	    } else {
	      resolvedKey = item[key] || '';
	    }
	
	    if (collection[resolvedKey] === undefined) {
	      collection[resolvedKey] = new _this.constructor([]);
	    }
	
	    collection[resolvedKey].push(item);
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var variadic = __webpack_require__(25);
	
	module.exports = function has() {
	  var _this = this;
	
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  var properties = variadic(args);
	
	  return properties.filter(function (key) {
	    return _this.items[key];
	  }).length === properties.length;
	};

/***/ }),
/* 37 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function implode(key, glue) {
	  if (glue === undefined) {
	    return this.items.join(key);
	  }
	
	  return new this.constructor(this.items).pluck(key).all().join(glue);
	};

/***/ }),
/* 38 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function intersect(values) {
	  var intersectValues = values;
	
	  if (values instanceof this.constructor) {
	    intersectValues = values.all();
	  }
	
	  var collection = this.items.filter(function (item) {
	    return intersectValues.indexOf(item) !== -1;
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 39 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function intersectByKeys(values) {
	  var _this = this;
	
	  var intersectKeys = Object.keys(values);
	
	  if (values instanceof this.constructor) {
	    intersectKeys = Object.keys(values.all());
	  }
	
	  var collection = {};
	
	  Object.keys(this.items).forEach(function (key) {
	    if (intersectKeys.indexOf(key) !== -1) {
	      collection[key] = _this.items[key];
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 40 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function isEmpty() {
	  return !this.items.length;
	};

/***/ }),
/* 41 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function isNotEmpty() {
	  return !!this.items.length;
	};

/***/ }),
/* 42 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function keyBy(key) {
	  var collection = {};
	
	  if (typeof key === 'function') {
	    this.items.forEach(function (item) {
	      collection[key(item)] = item;
	    });
	  } else {
	    this.items.forEach(function (item) {
	      collection[item[key] || ''] = item;
	    });
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function keys() {
	  var collection = Object.keys(this.items);
	
	  if (Array.isArray(this.items)) {
	    collection = collection.map(Number);
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 44 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function last(fn, defaultValue) {
	  var items = this.items;
	
	  if (typeof fn === 'function') {
	    items = this.filter(fn).all();
	  }
	
	  if (Array.isArray(items) && !items.length || !Object.keys(items).length) {
	    if (typeof defaultValue === 'function') {
	      return defaultValue();
	    }
	
	    return defaultValue;
	  }
	
	  if (Array.isArray(items)) {
	    return items[items.length - 1];
	  }
	  var keys = Object.keys(items);
	
	  return items[keys[keys.length - 1]];
	};

/***/ }),
/* 45 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function macro(name, fn) {
	  this.constructor.prototype[name] = fn;
	};

/***/ }),
/* 46 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function map(fn) {
	  var _this = this;
	
	  if (Array.isArray(this.items)) {
	    return new this.constructor(this.items.map(fn));
	  }
	
	  var collection = {};
	
	  Object.keys(this.items).forEach(function (key) {
	    collection[key] = fn(_this.items[key], key);
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 47 */
/***/ (function(module, exports) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	module.exports = function mapSpread(fn) {
	  return this.map(function (values, key) {
	    return fn.apply(undefined, _toConsumableArray(values).concat([key]));
	  });
	};

/***/ }),
/* 48 */
/***/ (function(module, exports) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	module.exports = function mapToDictionary(fn) {
	  var collection = {};
	
	  this.items.forEach(function (item, k) {
	    var _fn = fn(item, k),
	        _fn2 = _slicedToArray(_fn, 2),
	        key = _fn2[0],
	        value = _fn2[1];
	
	    if (collection[key] === undefined) {
	      collection[key] = [value];
	    } else {
	      collection[key].push(value);
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 49 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function mapInto(ClassName) {
	  return this.map(function (value, key) {
	    return new ClassName(value, key);
	  });
	};

/***/ }),
/* 50 */
/***/ (function(module, exports) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	module.exports = function mapToGroups(fn) {
	  var collection = {};
	
	  this.items.forEach(function (item, key) {
	    var _fn = fn(item, key),
	        _fn2 = _slicedToArray(_fn, 2),
	        keyed = _fn2[0],
	        value = _fn2[1];
	
	    if (collection[keyed] === undefined) {
	      collection[keyed] = [value];
	    } else {
	      collection[keyed].push(value);
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 51 */
/***/ (function(module, exports) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	module.exports = function mapWithKeys(fn) {
	  var _this = this;
	
	  var collection = {};
	
	  if (Array.isArray(this.items)) {
	    this.items.forEach(function (item) {
	      var _fn = fn(item),
	          _fn2 = _slicedToArray(_fn, 2),
	          keyed = _fn2[0],
	          value = _fn2[1];
	
	      collection[keyed] = value;
	    });
	  } else {
	    Object.keys(this.items).forEach(function (key) {
	      var _fn3 = fn(_this.items[key]),
	          _fn4 = _slicedToArray(_fn3, 2),
	          keyed = _fn4[0],
	          value = _fn4[1];
	
	      collection[keyed] = value;
	    });
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 52 */
/***/ (function(module, exports) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	module.exports = function max(key) {
	  if (typeof key === 'string') {
	    return Math.max.apply(Math, _toConsumableArray(this.pluck(key).all()));
	  }
	
	  return Math.max.apply(Math, _toConsumableArray(this.items));
	};

/***/ }),
/* 53 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function median(key) {
	  var length = this.items.length;
	
	  if (key === undefined) {
	    if (length % 2 === 0) {
	      return (this.items[length / 2 - 1] + this.items[length / 2]) / 2;
	    }
	
	    return this.items[Math.floor(length / 2)];
	  }
	
	  if (length % 2 === 0) {
	    return (this.items[length / 2 - 1][key] + this.items[length / 2][key]) / 2;
	  }
	
	  return this.items[Math.floor(length / 2)][key];
	};

/***/ }),
/* 54 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function merge(value) {
	  var arrayOrObject = value;
	
	  if (typeof arrayOrObject === 'string') {
	    arrayOrObject = [arrayOrObject];
	  }
	
	  if (Array.isArray(this.items) && Array.isArray(arrayOrObject)) {
	    return new this.constructor(this.items.concat(arrayOrObject));
	  }
	
	  var collection = JSON.parse(JSON.stringify(this.items));
	
	  Object.keys(arrayOrObject).forEach(function (key) {
	    collection[key] = arrayOrObject[key];
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 55 */
/***/ (function(module, exports) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	module.exports = function min(key) {
	  if (key !== undefined) {
	    return Math.min.apply(Math, _toConsumableArray(this.pluck(key).all()));
	  }
	
	  return Math.min.apply(Math, _toConsumableArray(this.items));
	};

/***/ }),
/* 56 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function mode(key) {
	  var values = [];
	  var highestCount = 1;
	
	  if (!this.items.length) {
	    return null;
	  }
	
	  this.items.forEach(function (item) {
	    var tempValues = values.filter(function (value) {
	      if (key !== undefined) {
	        return value.key === item[key];
	      }
	
	      return value.key === item;
	    });
	
	    if (!tempValues.length) {
	      if (key !== undefined) {
	        values.push({ key: item[key], count: 1 });
	      } else {
	        values.push({ key: item, count: 1 });
	      }
	    } else {
	      tempValues[0].count += 1;
	      var count = tempValues[0].count;
	
	      if (count > highestCount) {
	        highestCount = count;
	      }
	    }
	  });
	
	  return values.filter(function (value) {
	    return value.count === highestCount;
	  }).map(function (value) {
	    return value.key;
	  });
	};

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var values = __webpack_require__(12);
	
	module.exports = function nth(n) {
	  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	
	  var items = values(this.items);
	
	  var collection = items.slice(offset).filter(function (item, index) {
	    return index % n === 0;
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var variadic = __webpack_require__(25);
	
	module.exports = function only() {
	  var _this = this;
	
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  var properties = variadic(args);
	
	  if (Array.isArray(this.items)) {
	    var _collection = this.items.filter(function (item) {
	      return properties.indexOf(item) !== -1;
	    });
	
	    return new this.constructor(_collection);
	  }
	
	  var collection = {};
	
	  Object.keys(this.items).forEach(function (prop) {
	    if (properties.indexOf(prop) !== -1) {
	      collection[prop] = _this.items[prop];
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var clone = __webpack_require__(60);
	
	module.exports = function pad(size, value) {
	  var abs = Math.abs(size);
	  var count = this.count();
	
	  if (abs <= count) {
	    return this;
	  }
	
	  var diff = abs - count;
	  var items = clone(this.items);
	  var isArray = Array.isArray(this.items);
	  var prepend = size < 0;
	
	  for (var iterator = 0; iterator < diff;) {
	    if (!isArray) {
	      if (items[iterator] !== undefined) {
	        diff += 1;
	      } else {
	        items[iterator] = value;
	      }
	    } else if (prepend) {
	      items.unshift(value);
	    } else {
	      items.push(value);
	    }
	
	    iterator += 1;
	  }
	
	  return new this.constructor(items);
	};

/***/ }),
/* 60 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Clone helper
	 *
	 * Clone an array or object
	 *
	 * @param items
	 * @returns {*}
	 */
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	module.exports = function clone(items) {
	  var cloned = void 0;
	
	  if (Array.isArray(items)) {
	    var _cloned;
	
	    cloned = [];
	
	    (_cloned = cloned).push.apply(_cloned, _toConsumableArray(items));
	  } else {
	    cloned = {};
	
	    Object.keys(items).forEach(function (prop) {
	      cloned[prop] = items[prop];
	    });
	  }
	
	  return cloned;
	};

/***/ }),
/* 61 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function partition(fn) {
	  var _this = this;
	
	  var arrays = void 0;
	
	  if (Array.isArray(this.items)) {
	    arrays = [new this.constructor([]), new this.constructor([])];
	
	    this.items.forEach(function (item) {
	      if (fn(item) === true) {
	        arrays[0].push(item);
	      } else {
	        arrays[1].push(item);
	      }
	    });
	  } else {
	    arrays = [new this.constructor({}), new this.constructor({})];
	
	    Object.keys(this.items).forEach(function (prop) {
	      var value = _this.items[prop];
	
	      if (fn(value) === true) {
	        arrays[0].put(prop, value);
	      } else {
	        arrays[1].put(prop, value);
	      }
	    });
	  }
	
	  return new this.constructor(arrays);
	};

/***/ }),
/* 62 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function pipe(fn) {
	  return fn(this);
	};

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var nestedValue = __webpack_require__(64);
	
	var buildKeyPathMap = function buildKeyPathMap(items) {
	  var keyPaths = {};
	
	  items.forEach(function (item, index) {
	    function buildKeyPath(val, keyPath) {
	      if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
	        Object.keys(val).forEach(function (prop) {
	          buildKeyPath(val[prop], keyPath + '.' + prop);
	        });
	      }
	
	      keyPaths[keyPath] = val;
	    }
	
	    buildKeyPath(item, index);
	  });
	
	  return keyPaths;
	};
	
	module.exports = function pluck(value, key) {
	  if (value.indexOf('*') !== -1) {
	    var keyPathMap = buildKeyPathMap(this.items);
	
	    var keyMatches = [];
	
	    if (key !== undefined) {
	      var keyRegex = new RegExp('0.' + key, 'g');
	      var keyNumberOfLevels = ('0.' + key).split('.').length;
	
	      Object.keys(keyPathMap).forEach(function (k) {
	        var matchingKey = k.match(keyRegex);
	
	        if (matchingKey) {
	          var match = matchingKey[0];
	
	          if (match.split('.').length === keyNumberOfLevels) {
	            keyMatches.push(keyPathMap[match]);
	          }
	        }
	      });
	    }
	
	    var valueMatches = [];
	    var valueRegex = new RegExp('0.' + value, 'g');
	    var valueNumberOfLevels = ('0.' + value).split('.').length;
	
	    Object.keys(keyPathMap).forEach(function (k) {
	      var matchingValue = k.match(valueRegex);
	
	      if (matchingValue) {
	        var match = matchingValue[0];
	
	        if (match.split('.').length === valueNumberOfLevels) {
	          valueMatches.push(keyPathMap[match]);
	        }
	      }
	    });
	
	    if (key !== undefined) {
	      var collection = {};
	
	      this.items.forEach(function (item, index) {
	        collection[keyMatches[index] || ''] = valueMatches;
	      });
	
	      return new this.constructor(collection);
	    }
	
	    return new this.constructor([valueMatches]);
	  }
	
	  if (key !== undefined) {
	    var _collection = {};
	
	    this.items.forEach(function (item) {
	      if (nestedValue(item, value) !== undefined) {
	        _collection[item[key] || ''] = nestedValue(item, value);
	      } else {
	        _collection[item[key] || ''] = null;
	      }
	    });
	
	    return new this.constructor(_collection);
	  }
	
	  return this.map(function (item) {
	    if (nestedValue(item, value) !== undefined) {
	      return nestedValue(item, value);
	    }
	
	    return null;
	  });
	};

/***/ }),
/* 64 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Get value of a nested property
	 *
	 * @param mainObject
	 * @param key
	 * @returns {*}
	 */
	
	module.exports = function nestedValue(mainObject, key) {
	  try {
	    return key.split('.').reduce(function (obj, property) {
	      return obj[property];
	    }, mainObject);
	  } catch (err) {
	    return null;
	  }
	};

/***/ }),
/* 65 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function pop() {
	  if (Array.isArray(this.items)) {
	    return this.items.pop();
	  }
	
	  var keys = Object.keys(this.items);
	  var key = keys[keys.length - 1];
	  var last = this.items[key];
	
	  delete this.items[key];
	
	  return last;
	};

/***/ }),
/* 66 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function prepend(value, key) {
	  if (key !== undefined) {
	    return this.put(key, value);
	  }
	
	  this.items.unshift(value);
	
	  return this;
	};

/***/ }),
/* 67 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function pull(key, defaultValue) {
	  var returnValue = this.items[key] || null;
	
	  if (!returnValue && defaultValue !== undefined) {
	    if (typeof defaultValue === 'function') {
	      returnValue = defaultValue();
	    } else {
	      returnValue = defaultValue;
	    }
	  }
	
	  delete this.items[key];
	
	  return returnValue;
	};

/***/ }),
/* 68 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function push() {
	  var _items;
	
	  (_items = this.items).push.apply(_items, arguments);
	
	  return this;
	};

/***/ }),
/* 69 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function put(key, value) {
	  this.items[key] = value;
	
	  return this;
	};

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var values = __webpack_require__(12);
	
	module.exports = function random() {
	  var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
	
	  var items = values(this.items);
	
	  var collection = new this.constructor(items).shuffle();
	
	  if (length === 1) {
	    return collection.first();
	  }
	
	  return collection.take(length);
	};

/***/ }),
/* 71 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function reduce(fn, carry) {
	  var _this = this;
	
	  var reduceCarry = null;
	
	  if (carry !== undefined) {
	    reduceCarry = carry;
	  }
	
	  if (Array.isArray(this.items)) {
	    this.items.forEach(function (item) {
	      reduceCarry = fn(reduceCarry, item);
	    });
	  } else {
	    Object.keys(this.items).forEach(function (key) {
	      reduceCarry = fn(reduceCarry, _this.items[key], key);
	    });
	  }
	
	  return reduceCarry;
	};

/***/ }),
/* 72 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function reject(fn) {
	  return new this.constructor(this.items.filter(function (item) {
	    return !fn(item);
	  }));
	};

/***/ }),
/* 73 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function reverse() {
	  var collection = [].concat(this.items).reverse();
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 74 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function search(valueOrFunction, strict) {
	  var _this = this;
	
	  var valueFn = valueOrFunction;
	
	  if (typeof valueOrFunction === 'function') {
	    valueFn = this.items.filter(function (value, key) {
	      return valueOrFunction(value, key);
	    })[0];
	  }
	
	  var index = false;
	
	  if (Array.isArray(this.items)) {
	    var itemKey = this.items.filter(function (item) {
	      if (strict === true) {
	        return item === valueFn;
	      }
	
	      return item === Number(valueFn) || item === valueFn.toString();
	    })[0];
	
	    index = this.items.indexOf(itemKey);
	  } else {
	    return Object.keys(this.items).filter(function (prop) {
	      if (strict === true) {
	        return _this.items[prop] === valueFn;
	      }
	
	      return _this.items[prop] === Number(valueFn) || _this.items[prop] === valueFn.toString();
	    })[0] || false;
	  }
	
	  if (index === -1) {
	    return false;
	  }
	
	  return index;
	};

/***/ }),
/* 75 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function shift() {
	  if (Array.isArray(this.items)) {
	    return this.items.shift();
	  }
	
	  var key = Object.keys(this.items)[0];
	  var value = this.items[key] || null;
	  delete this.items[key];
	
	  return value;
	};

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var values = __webpack_require__(12);
	
	module.exports = function shuffle() {
	  var items = values(this.items);
	
	  var j = void 0;
	  var x = void 0;
	  var i = void 0;
	
	  for (i = items.length; i; i -= 1) {
	    j = Math.floor(Math.random() * i);
	    x = items[i - 1];
	    items[i - 1] = items[j];
	    items[j] = x;
	  }
	
	  this.items = items;
	
	  return this;
	};

/***/ }),
/* 77 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function slice(remove, limit) {
	  var collection = this.items.slice(remove);
	
	  if (limit !== undefined) {
	    collection = collection.slice(0, limit);
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 78 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function sort(fn) {
	  var collection = [].concat(this.items);
	
	  if (fn === undefined) {
	    if (this.every(function (item) {
	      return typeof item === 'number';
	    })) {
	      collection.sort(function (a, b) {
	        return a - b;
	      });
	    } else {
	      collection.sort();
	    }
	  } else {
	    collection.sort(fn);
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 79 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function sortBy(valueOrFunction) {
	  var collection = [].concat(this.items);
	
	  if (typeof valueOrFunction === 'function') {
	    collection.sort(function (a, b) {
	      if (valueOrFunction(a) < valueOrFunction(b)) return -1;
	      if (valueOrFunction(a) > valueOrFunction(b)) return 1;
	
	      return 0;
	    });
	  } else {
	    collection.sort(function (a, b) {
	      if (a[valueOrFunction] < b[valueOrFunction]) return -1;
	      if (a[valueOrFunction] > b[valueOrFunction]) return 1;
	
	      return 0;
	    });
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 80 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function sortByDesc(valueOrFunction) {
	  return this.sortBy(valueOrFunction).reverse();
	};

/***/ }),
/* 81 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function splice(index, limit, replace) {
	  var slicedCollection = this.slice(index, limit);
	
	  this.items = this.diff(slicedCollection.all()).all();
	
	  if (Array.isArray(replace)) {
	    for (var iterator = 0, length = replace.length; iterator < length; iterator += 1) {
	      this.items.splice(index + iterator, 0, replace[iterator]);
	    }
	  }
	
	  return slicedCollection;
	};

/***/ }),
/* 82 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function split(numberOfGroups) {
	  var itemsPerGroup = Math.round(this.items.length / numberOfGroups);
	
	  var items = JSON.parse(JSON.stringify(this.items));
	  var collection = [];
	
	  for (var iterator = 0; iterator < numberOfGroups; iterator += 1) {
	    collection.push(new this.constructor(items.splice(0, itemsPerGroup)));
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 83 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function sum(key) {
	  var total = 0;
	
	  if (key === undefined) {
	    for (var i = 0, length = this.items.length; i < length; i += 1) {
	      total += this.items[i];
	    }
	  } else if (typeof key === 'function') {
	    for (var _i = 0, _length = this.items.length; _i < _length; _i += 1) {
	      total += key(this.items[_i]);
	    }
	  } else {
	    for (var _i2 = 0, _length2 = this.items.length; _i2 < _length2; _i2 += 1) {
	      total += this.items[_i2][key];
	    }
	  }
	
	  return total;
	};

/***/ }),
/* 84 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function take(length) {
	  var _this = this;
	
	  if (!Array.isArray(this.items) && _typeof(this.items) === 'object') {
	    var keys = Object.keys(this.items);
	    var slicedKeys = void 0;
	
	    if (length < 0) {
	      slicedKeys = keys.slice(length);
	    } else {
	      slicedKeys = keys.slice(0, length);
	    }
	
	    var collection = {};
	
	    keys.forEach(function (prop) {
	      if (slicedKeys.indexOf(prop) !== -1) {
	        collection[prop] = _this.items[prop];
	      }
	    });
	
	    return new this.constructor(collection);
	  }
	
	  if (length < 0) {
	    return new this.constructor(this.items.slice(length));
	  }
	
	  return new this.constructor(this.items.slice(0, length));
	};

/***/ }),
/* 85 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function tap(fn) {
	  fn(this);
	
	  return this;
	};

/***/ }),
/* 86 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function times(n, fn) {
	  for (var iterator = 1; iterator <= n; iterator += 1) {
	    this.items.push(fn(iterator));
	  }
	
	  return this;
	};

/***/ }),
/* 87 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function toArray() {
	  var collectionInstance = this.constructor;
	
	  function iterate(list, collection) {
	    var childCollection = [];
	
	    if (list instanceof collectionInstance) {
	      list.items.forEach(function (i) {
	        return iterate(i, childCollection);
	      });
	      collection.push(childCollection);
	    } else if (Array.isArray(list)) {
	      list.forEach(function (i) {
	        return iterate(i, childCollection);
	      });
	      collection.push(childCollection);
	    } else {
	      collection.push(list);
	    }
	  }
	
	  if (Array.isArray(this.items)) {
	    var collection = [];
	
	    this.items.forEach(function (items) {
	      iterate(items, collection);
	    });
	
	    return collection;
	  }
	
	  return this.values().all();
	};

/***/ }),
/* 88 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function toJson() {
	  if (_typeof(this.items) === 'object' && !Array.isArray(this.items)) {
	    return JSON.stringify(this.all());
	  }
	
	  return JSON.stringify(this.toArray());
	};

/***/ }),
/* 89 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function transform(fn) {
	  var _this = this;
	
	  if (Array.isArray(this.items)) {
	    this.items = this.items.map(fn);
	  } else {
	    var collection = {};
	
	    Object.keys(this.items).forEach(function (key) {
	      collection[key] = fn(_this.items[key], key);
	    });
	
	    this.items = collection;
	  }
	
	  return this;
	};

/***/ }),
/* 90 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function when(value, fn, defaultFn) {
	  if (!value) {
	    fn(this);
	  } else {
	    defaultFn(this);
	  }
	};

/***/ }),
/* 91 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function union(object) {
	  var _this = this;
	
	  var collection = JSON.parse(JSON.stringify(this.items));
	
	  Object.keys(object).forEach(function (prop) {
	    if (_this.items[prop] === undefined) {
	      collection[prop] = object[prop];
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 92 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function unique(key) {
	  var collection = void 0;
	
	  if (key === undefined) {
	    collection = this.items.filter(function (element, index, self) {
	      return self.indexOf(element) === index;
	    });
	  } else {
	    collection = [];
	
	    var usedKeys = [];
	
	    for (var iterator = 0, length = this.items.length; iterator < length; iterator += 1) {
	      var uniqueKey = void 0;
	      if (typeof key === 'function') {
	        uniqueKey = key(this.items[iterator]);
	      } else {
	        uniqueKey = this.items[iterator][key];
	      }
	
	      if (usedKeys.indexOf(uniqueKey) === -1) {
	        collection.push(this.items[iterator]);
	        usedKeys.push(uniqueKey);
	      }
	    }
	  }
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 93 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function unwrap(value) {
	  if (value instanceof this.constructor) {
	    return value.all();
	  }
	
	  return value;
	};

/***/ }),
/* 94 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function values() {
	  var _this = this;
	
	  var collection = [];
	
	  Object.keys(this.items).forEach(function (property) {
	    collection.push(_this.items[property]);
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 95 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function when(value, fn, defaultFn) {
	  if (value) {
	    return fn(this, value);
	  } else if (defaultFn) {
	    return defaultFn(this, value);
	  }
	
	  return this;
	};

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var values = __webpack_require__(12);
	var nestedValue = __webpack_require__(64);
	
	module.exports = function where(key, operator, value) {
	  var comparisonOperator = operator;
	  var comparisonValue = value;
	
	  if (value === undefined) {
	    comparisonValue = operator;
	    comparisonOperator = '===';
	  }
	
	  var items = values(this.items);
	
	  var collection = items.filter(function (item) {
	    switch (comparisonOperator) {
	      case '==':
	        return nestedValue(item, key) === Number(comparisonValue) || nestedValue(item, key) === comparisonValue.toString();
	
	      default:
	      case '===':
	        return nestedValue(item, key) === comparisonValue;
	
	      case '!=':
	      case '<>':
	        return nestedValue(item, key) !== Number(comparisonValue) && nestedValue(item, key) !== comparisonValue.toString();
	
	      case '!==':
	        return nestedValue(item, key) !== comparisonValue;
	
	      case '<':
	        return nestedValue(item, key) < comparisonValue;
	
	      case '<=':
	        return nestedValue(item, key) <= comparisonValue;
	
	      case '>':
	        return nestedValue(item, key) > comparisonValue;
	
	      case '>=':
	        return nestedValue(item, key) >= comparisonValue;
	
	    }
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var extractValues = __webpack_require__(12);
	var nestedValue = __webpack_require__(64);
	
	module.exports = function whereIn(key, values) {
	  var items = extractValues(values);
	
	  var collection = this.items.filter(function (item) {
	    return items.indexOf(nestedValue(item, key)) !== -1;
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var extractValues = __webpack_require__(12);
	var nestedValue = __webpack_require__(64);
	
	module.exports = function whereNotIn(key, values) {
	  var items = extractValues(values);
	
	  var collection = this.items.filter(function (item) {
	    return items.indexOf(nestedValue(item, key)) === -1;
	  });
	
	  return new this.constructor(collection);
	};

/***/ }),
/* 99 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function wrap(value) {
	  if (value instanceof this.constructor) {
	    return value;
	  }
	
	  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
	    return new this.constructor(value);
	  }
	
	  return new this.constructor([value]);
	};

/***/ }),
/* 100 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function zip(array) {
	  var _this = this;
	
	  var values = array;
	
	  if (values instanceof this.constructor) {
	    values = values.all();
	  }
	
	  var collection = this.items.map(function (item, index) {
	    return new _this.constructor([item, values[index]]);
	  });
	
	  return new this.constructor(collection);
	};

/***/ })
/******/ ]);
//# sourceMappingURL=cctv.js.map