var screenfull = require('screenfull');

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
                cb(ret.response.hls);
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
        return false;
    };
})(jQuery);