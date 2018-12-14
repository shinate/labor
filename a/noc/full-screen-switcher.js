var screenfull = require('screenfull');

module.exports = window.FullScreenSwitcher = function (node) {
    var fullSceneBTN = $('<a href="#"></a>').appendTo($('body'))
        .css({
            background       : 'rgba(255,255,255,0.2) url(http://img.alicdn.com/tfs/TB1WmSuaKSSBuNjy0FlXXbBpVXa-200-200.png) no-repeat scroll 50% 50%',
            position         : 'fixed',
            height           : '30vh',
            width            : '30vh',
            top              : '50%',
            left             : '50%',
            'border-radius'  : '100%',
            'background-size': '22vh',
            transform        : 'translate3d(-50%,-50%,0)',
            opacity          : 0
        })
        .on('click', function (e) {
            e.preventDefault();
            if (screenfull.enabled) {
                screenfull.request(document.documentElement);
            }
            return false;
        })
        .on('mouseenter', function () {
            if (screenfull.isFullscreen) {
                return false;
            }
            $(this).css('opacity', 1);
        })
        .on('mouseout', function () {
            if (screenfull.isFullscreen) {
                return false;
            }
            $(this).css('opacity', 0);
        });

    if (screenfull.enabled) {
        screenfull.on('change', function () {
            // console.log('Am I fullscreen?', screenfull.isFullscreen ? 'Yes' : 'No');
            if (screenfull.isFullscreen) {
                node.css('opacity', 0.99);
                setTimeout(function () {
                    node.css('opacity', 1);
                    fullSceneBTN.hide();
                }, 300);
            } else {
                fullSceneBTN.css({'display': 'initial', 'opacity': 0});
            }
        });
    }
};