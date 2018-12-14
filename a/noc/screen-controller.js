/**
 * Created by shinate on 2018/9/5.
 */

var TYPE_ORIGINAL = 0;
var TYPE_STRETCH = 1;
var TYPE_COVER = 2;
var TYPE_CONTAIN = 3;
var ALLOWED_TYPES = [TYPE_ORIGINAL, TYPE_STRETCH, TYPE_COVER, TYPE_CONTAIN];

var STYLE_TRANSLATE = 'translate3d(-50%, -50%, 0)';

var DEFAULT_OPTIONS = {
    height       : -1,
    width        : -1,
    contentHeight: '100%',
    contentWidth : '100%',
    position     : [0, 0],
    type         : TYPE_ORIGINAL
};

function screenController(node, options) {
    this.init.apply(this, Array.prototype.slice.call(arguments));
    this.render();

    this.listen();
}

var SCP = screenController.prototype;

SCP.init = function init(node, options) {

    this.contentNode = node;
    this.node = $('<dev></dev>').prependTo(this.contentNode.parent()).append(this.contentNode);
    this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});

    if (this.options.height <= 0) {
        this.options.height = this.node.height();
    } else {
        this.node.css('height', this.options.height);
    }

    if (this.options.width <= 0) {
        this.options.height = this.node.width();
    } else {
        this.node.css('width', this.options.width);
    }

    this.wrapper = this.node.parent();

    if (this.wrapper !== $(document.body)) {
        this.wrapper.css('position', 'relative');
    }

    this.contentNode.css({
        position : 'absolute',
        transform: 'translate3d(' + (-this.options.position[0] * 50) + '%' + ', ' + (-this.options.position[1] * 50) + '%' + ', 0)',
        height   : this.options.contentHeight,
        width    : this.options.contentWidth
    });

    this.node.css({
        position: 'absolute',
        overflow: 'hidden',
        left    : '50%',
        top     : '50%'
    });

    if (0 > ALLOWED_TYPES.indexOf(this.options.type)) {
        this.options.type = TYPE_ORIGINAL;
    }
};

SCP.render = function render() {
    this.wrapperHeight = this.wrapper.height();
    this.wrapperWidth = this.wrapper.width();

    var scale = null;

    switch (this.options.type) {

        case TYPE_STRETCH:
            scale = 'scale3d(' +
                [
                    this.wrapperWidth / this.options.width,
                    this.wrapperHeight / this.options.height,
                    1
                ].join(',') + ')';
            break;
        case TYPE_COVER:
            var _s;
            if (this.wrapperWidth / this.wrapperHeight < this.options.width / this.options.height) {
                _s = this.wrapperWidth / this.options.width;
                scale = 'scale3d(' +
                    [
                        _s,
                        _s,
                        1
                    ].join(',') + ')';
            } else {
                _s = this.wrapperHeight / this.options.height;
                scale = 'scale3d(' +
                    [
                        _s,
                        _s,
                        1
                    ].join(',') + ')';
            }
            break;
        case TYPE_CONTAIN:
            var _s;
            if (this.wrapperWidth / this.wrapperHeight > this.options.width / this.options.height) {
                _s = this.wrapperWidth / this.options.width;
                scale = 'scale3d(' +
                    [
                        _s,
                        _s,
                        1
                    ].join(',') + ')';
            } else {
                _s = this.wrapperHeight / this.options.height;
                scale = 'scale3d(' +
                    [
                        _s,
                        _s,
                        1
                    ].join(',') + ')';
            }
            break;
        case TYPE_ORIGINAL:
        default:
            // do nothing
            break;

    }

    if (scale) {
        this.node.css('transform', [STYLE_TRANSLATE, scale].join(' '));
    }
};

SCP.listen = function listen() {
    $(window).on('resize', this.render.bind(this));
};

function SC(node, options) {
    return new screenController(node, options || {});
}

SC.TYPE_ORIGINAL = TYPE_ORIGINAL;
SC.TYPE_STRETCH = TYPE_STRETCH;
SC.TYPE_COVER = TYPE_COVER;
SC.TYPE_CONTAIN = TYPE_CONTAIN;

module.exports = window.screenController = SC;