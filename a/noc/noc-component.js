var formatNum = require('format-num');
var parseNum = require('parse-num');

var DEFAULT_OPTIONS = {};

function NC(el, options) {
    this.init(el, options || {});
}

var NCP = NC.prototype;

NCP.init = function init(el, options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
    this.node = el;
    this.source = el.attr('source');
    this.reflush = parseInt((el.attr('reflush') || this.options.reflush) * 1e3); // 转换为毫秒
    this.requestLock = false;

    this.yields = {};
    this.rendererList = {};

    for (var name in renderer) {
        this.registerRenderer(name, renderer[name]);
    }

    this.node.find('[yield]').each(function (_, el) {
        this.yields[$(el).attr('yield')] = $(el);
    }.bind(this));

    this.reload();

    if (this.reflush > 0) {
        setInterval(this.reload.bind(this), this.reflush);
    }

    // console.log(this);
};

NCP.registerRenderer = function (name, func) {
    this.rendererList[name] = func;
};

NCP.getRenderer = function (name) {
    if (name != null) {
        if (this.rendererList.hasOwnProperty(name)) {
            return this.rendererList[name].bind(this);
        } else if (window.hasOwnProperty(name)) {
            return window[name].bind(this);
        }
    }
    return this.rendererList.default.bind(this);
};

NCP.reload = function reload() {
    if (this.requestLock) {
        return;
    }
    this.requestLock = true;
    $.getJSON(this.source)
        .done(function (ret) {
            console.log(this.source, ret);
            if (ret && ret.code === 0 && ret.response != null) {
                this.render(ret.response);
            }
        }.bind(this))
        .fail(function () {

        }.bind(this))
        .always(function () {
            this.requestLock = false;
        }.bind(this))
};

NCP.render = function renderSET(data) {
    for (var yield in this.yields) {
        if (this.yields.hasOwnProperty(yield)) {
            var value = getValue(data, yield);
            if (value != null) {
                var el = this.yields[yield];
                // 渲染器
                this.getRenderer(el.attr('render'))(el, value);
            }
        }
    }
};

function getValue(obj, key) {
    if (key === '__ROOT__') {
        return obj;
    }
    function g(o, ks) {
        var k = ks.shift();
        if (ks.length == 0) {
            return o[k];
        } else {
            if ($.isPlainObject(o[k])) {
                return g(o[k], ks);
            } else {
                return o[k];
            }
        }
    }

    return g(obj, key.split('.'));
}

var renderer = {
    default: function (el, value) {
        el.prop('cached-value', value);
        el.text(value);
    },
    flask: function (el, value) {
        value = parseNum(value);

        if (value === el.prop('cached-value')) {
            return;
        }

        el.prop('cached-value', value);

        var LSN;

        if (value === 0) {
            el.text(formatNum(value, {maxFraction: 2}));
        } else {
            if (LSN) {
                clearInterval(LSN);
            }
            LSN = setInterval((function (el, value) {
                var isInt = parseInt(value) === value;
                var step = value / 20;
                var current = 0;
                return function () {
                    current += step + Math.random() / 10;
                    if (isInt) {
                        current = Math.ceil(current);
                    }
                    if (current >= value) {
                        current = value;
                        clearInterval(LSN);
                    }
                    el.text(formatNum(current, {maxFraction: 2}));
                };
            })(el, value), 50);
        }
    },
    table: function (el, data) {

        var rows = parseInt(this.node.attr('rows')) || 5;

        var wrapper = el.parent();
        var loopTpl = el;
        var rowHeight = wrapper.height() / rows;

        wrapper.empty();
        data.map(function (item, index) {
            var loopd = loopTpl.clone();
            loopd.css({
                height: rowHeight + 'px',
                'line-height': rowHeight + 'px',
                'background-color': index % 2 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)'
            });
            loopd.find('[column]').each(function (_, el) {
                var el = $(el);
                var key = el.attr('column');
                el.text(item[key]);
            }.bind(this));
            wrapper.append(loopd);
        });

        this.slicker = wrapper.slick({
            arrows: false,
            autoplay: true,
            autoplaySpeed: 10000,
            vertical: true
        });
    }
};

module.exports = window.nocComponent = function (el) {
    return new NC(el);
};