/**
 * Created by shinate on 16/6/14.
 */

(function (global) {
    !global.__TOOLS__ && (global.__TOOLS__ = {});

    var $T = global.__TOOLS__;

    $T.__MODEL__ = {};
    $T.__INSTANCES__ = {};

    $T.device = (function () {
        // IOS desktop has touch events, make them busting
        var hasTouch = !!(('ontouchstart' in global && !/Mac OS X /.test(global.navigator.userAgent)) || global.DocumentTouch && document instanceof global.DocumentTouch);
        return {
            hasTouch: hasTouch,
            startEvt: hasTouch ? 'touchstart' : 'mousedown',
            moveEvt: hasTouch ? 'touchmove' : 'mousemove',
            endEvt: hasTouch ? 'touchend' : 'mouseup',
            cancelEvt: hasTouch ? 'touchcancel' : 'mouseout',
            resizeEvt: 'onorientationchange' in global ? 'orientationchange' : 'resize'
        };
    })();

    $T.getPosition = function (e) {
        var oe = e;
        if ('originalEvent' in oe) {
            oe = e.originalEvent;
        }
        if ($T.device.hasTouch) {
            oe = oe.changedTouches[0];
        }
        return oe;
    };

    $T.numberRange = function range(val, min, max) {
        if (!!isNaN(min)) {
            min = 0;
        }
        if (!!isNaN(max)) {
            max = 1;
        }
        return Math.max(min, Math.min(max, val));
    };

    $T.slideInputRange = (function ($T) {

        return function (target, node, min, max) {

            var startPos;
            var inputValue;
            var isMoving = false;

            if (node == null) {
                node = target;
            }

            node.on($T.device.startEvt, function (e) {
                if (target.get(0) === e.target) {
                    startPos = $T.getPosition(e).pageX;
                    inputValue = +target.val();
                }
            }).on($T.device.moveEvt, function (e) {
                if (startPos != null) {
                    var offset = $T.getPosition(e).pageX - startPos;
                    if (!isMoving) {
                        if (Math.abs(offset) >= 2) {
                            isMoving = true;
                        }
                    }
                    if (isMoving) {
                        target.val($T.numberRange(inputValue + Math.round(Math.pow(offset, 3) / node.width()), min, max));
                        target.blur();
                        return false;
                    }
                }
            }).on($T.device.endEvt, function () {
                startPos = null;
                isMoving = false;
            }).on($T.device.cancelEvt, function (e) {
                if (!this.contains(e.relatedTarget)) {
                    startPos = null;
                    isMoving = false;
                }
            });

        };

    })($T);

    $T.__CARD__ = (function () {

        function size() {
            return [$(window).width(), $(window).height()];
        }

        return function (node) {

            var name = node.data('name');

            node.append('<div class="tools-title">' + name + '</div>');

            return {
                name: name,
                show: function () {
                    console.log(size());
                    console.log('show ' + name);
                },
                hide: function () {
                    console.log('hide ' + name);
                },
                input: null,
                output: null
            }
        }
    })();

    $(document).ready(function () {
        var $I = $T.__INSTANCES__;
        var $M = $T.__MODEL__;

        $('.card').each(function () {
            var el = $(this);
            var model = el.data('model');
            if (model) {
                $I[model] = $M[model](el);
            }
        });
    });
})(window);

(function ($T) {
    $T.__MODEL__.tokenCreater = (function () {

        function randomString(length, complex) {

            var seed = [
                '0123456789',
                'abcdefghijklmnopqrstuvwxyz',
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                '+_)(*&^%$#@!~=-`;:<>,.?/\\|'
            ];

            var source;

            if (complex > 0) {
                source = [];
                if ((complex & 1) === 1) {
                    source.push(seed[0]);
                }
                if ((complex & 2) === 2) {
                    source.push(seed[1]);
                }
                if ((complex & 4) === 4) {
                    source.push(seed[2]);
                }
                if ((complex & 8) === 8) {
                    source.push(seed[3]);
                }
            } else {
                source = seed.slice(0, 3);
            }

            source = source.join('');

            var tmp = [];
            for (var i = 0; i < length; i++) {
                tmp.push(source.charAt(Math.ceil(Math.random() * 10000) % source.length));
            }
            return tmp.join('');
        }

        return function (node) {

            var it = $T.__CARD__(node);

            var nodes = {};

            nodes.input = node.find('[role="length"] input');
            nodes.output = node.find('[role="panel"] textarea');

            node.find('[role="complex"] button').on('click', function () {
                var el = $(this);
                if (el.hasClass('btn-success')) {
                    el.removeClass('btn-success')
                } else {
                    el.addClass('btn-success');
                }
            });

            node.find('.create').on('click', function () {
                var c = 0;
                node.find('[role="complex"] .btn-success').each(function () {
                    c += +$(this).val();
                });
                var length = $T.numberRange(+nodes.input.val() || 16, 0, 1024);
                nodes.input.val(length);
                nodes.output.val(randomString(length, c));
            });

            $T.slideInputRange(nodes.input, node, 0, 1024);

            it.input = function () {

            };

            it.output = function () {

            };

            return it;
        }
    })();
})(window.__TOOLS__);