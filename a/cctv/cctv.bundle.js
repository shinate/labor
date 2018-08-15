var videojs = require('video.js')['default'];
var collect = require('collect.js');

require('videojs-contrib-hls.js');

module.exports = window.CCTV = (function ($) {

    var MATRIX_SOURCES = collect();
    var MATRIX = collect([1, 4, 9, 12, 16]);
    var CURRENT_MATRIX = 0;
    var PLAYER_NUM = 0;

    function CCTV(options) {
        this.init();
        console.log(fitMatrix(18));
        console.log(uniqueID());
        console.log(getFreeScreen());
    }

    var CP = CCTV.prototype;

    CP.init = function () {
        var that = this;
        this.node = $('.matrix');
        for (var i = 0; i < MATRIX.max(); i++) {
            var article = $('<article class="screen"><button type="button" class="reload fa fa-sync-alt"></button><button type="button" class="remove fa fa-times"></button></article>');
            this.node.append(article);
            MATRIX_SOURCES.push({
                ID: null,
                container: article,
                sources: null,
                player: null
            });
        }

        $(window).on('resize', this.reSizeScreens.bind(this))

        this.node
            .on('click', '.reload', function () {
                that.reload($(this).parent().find(':eq(0)').attr('id'));
            })
            .on('click', '.remove', function () {
                that.remove($(this).parent().find(':eq(0)').attr('id'));
            });

        // this.add('http://hls.open.ys7.com/openlive/e1cdd92412fb44ee857e10f771cb0db5.m3u8');
        // this.add('http://hls.open.ys7.com/openlive/4c0dcd9d730f4a85b59a078f806209fe.m3u8');
        // this.add('http://hls.open.ys7.com/openlive/46c404a581d247829d08c41a0ec4e394.m3u8');
    };

    CP.add = function add(sources) {
        if (MATRIX_SOURCES.where('sources', sources).count()) {
            return;
        }
        var SCREEN = getFreeScreen();
        SCREEN.sources = sources;
        SCREEN.ID = uniqueID();
        var dom = $('' +
            '<video id="' + SCREEN.ID + '" class="video-js" autoplay>' +
            '<source src="' + SCREEN.sources + '" type="application/x-mpegURL">' +
            '</video>');
        SCREEN.container.prepend(dom);
        SCREEN.container.addClass('screen-actived');
        SCREEN.player = videojs(dom.get(0));

        this.reflexMatrix();
    };

    CP.remove = function remove(idOrSource) {
        var SCREEN = getScreenByIdOrSource(idOrSource);

        if (SCREEN == null) {
            return;
        }

        SCREEN.container.removeClass('screen-actived');
        SCREEN.player.dispose();
        SCREEN.player = null;
        SCREEN.sources = null;
        SCREEN.ID = null;
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
                if (index === 0) {
                    CURRENT_MATRIX = 0;
                } else {
                    CURRENT_MATRIX = MATRIX.get(index - 1);
                }
            }
            this.node.attr('class', 'matrix matrix-' + CURRENT_MATRIX);
            this.reSizeScreens();
        }
    };

    CP.reflexMatrix = function reflexMatrix() {
        PLAYER_NUM = getPlayerNUM();
        CURRENT_MATRIX = fitMatrix(PLAYER_NUM);

        console.log(PLAYER_NUM, CURRENT_MATRIX);
        this.node.attr('class', 'matrix matrix-' + CURRENT_MATRIX);
        this.reSizeScreens();
    };

    CP.reSizeScreens = function reSizeScreens() {
        if (PLAYER_NUM > 0 && CURRENT_MATRIX > 0) {
            var ruleSizeDOM = this.node.find('> article:eq(0)');
            var ruleSize = {width: ruleSizeDOM.width(), height: ruleSizeDOM.height()};
            MATRIX_SOURCES.each(function (item) {
                if (item.player != null) {
                    $('#' + item.ID).css(ruleSize);
                }
            });
        }
    };

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

    function fitMatrix(len) {
        return len > 0 ? (MATRIX.filter(function (item) {
            return item >= len;
        }).first() || MATRIX.max()) : 0;
    }

    return new CCTV;

})(require('jquery'));