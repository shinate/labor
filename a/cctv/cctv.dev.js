var videojs = window.videojs; // require('video.js');
var collect = require('collect.js');

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