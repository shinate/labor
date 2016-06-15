/**
 * Created by shinate on 16/6/14.
 */

(function (global) {
    !global.__TOOLS__ && (global.__TOOLS__ = {});

    $T = global.__TOOLS__;

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
                }
            }
        }
    })();

    $(document).ready(function () {
        $I = $T.__INSTANCES__ = {};

        $('.card').each(function () {
            var el = $(this);
            var model = el.data('model');
            if (model) {
                $I[model] = $T[model](el);
            }
        });
    });
})(window);

(function ($T) {
    $T.tokenCreater = (function () {

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

        function limit(val) {
            return Math.max(0, Math.min(1024, val));
        }

        return function (node) {

            var it = $T.__CARD__(node);

            var nodes = {};

            nodes.input = node.find('[role="length"] input');
            nodes.output = node.find('[role="panel"] textarea');

            var startPos;
            var inputValue;
            var isMoving = false;

            node.on('mousedown', function (e) {
                if (nodes.input.get(0) === e.target) {
                    startPos = e.pageX;
                    inputValue = +nodes.input.val() || 16;
                }
            }).on('mousemove', function (e) {
                if (startPos != null) {
                    var offset = e.pageX - startPos;
                    if (!isMoving) {
                        if (Math.abs(offset) >= 2) {
                            isMoving = true;
                        }
                    }
                    if (isMoving) {
                        nodes.input.val(limit(inputValue + Math.round(offset)));
                        nodes.input.blur();
                        return false;
                    }
                }
            }).on('mouseup', function () {
                startPos = null;
                isMoving = false;
            }).on('mouseout', function (e) {
                if (!this.contains(e.relatedTarget)) {
                    startPos = null;
                    isMoving = false;
                }
            });

            node.find('[role="complex"] button').on('click', function () {
                var el = $(this);
                if (el.hasClass('btn-success')) {
                    el.removeClass('btn-success')
                } else {
                    el.addClass('btn-success');
                }
                el.blur();
            });

            node.find('.create').on('click', function () {
                var c = 0;
                node.find('[role="complex"] .btn-success').each(function () {
                    c += +$(this).val();
                });
                var length = limit(+nodes.input.val() || 16);
                nodes.input.val(length);
                nodes.output.val(randomString(length, c));
            });


            it.input = function () {

            };

            it.output = function () {

            };

            return it;
        }
    })();
})(window.__TOOLS__);