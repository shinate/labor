var ZERO_BASE = [0xF1, 0x52, 0x49, 0xE9, 0xAE, 0xF1, 0x90, 0xBB];
var MASK = [4, 1, 3, 7, 0, 5, 2, 6];

function encode(value) {
    var value = parseInt(value);
    if (value < -0x80000000 || value > 0x7FFFFFFF)
        return '';
    return ZERO_BASE.map(function (_B_, i) {
        var mask = MASK[i] * 4;
        return ('0' + (((((0xF << mask) & value) >> mask) + _B_) & 0xFF).toString(16).toUpperCase()).slice(-2);
    }).join(' ');
}

$('#BTN_ENCODE').on('click', function () {
    $('#HEX').val(encode($('#INT').val()));
    return false;
});

function decode(hex) {
    var hex = hex.replace(/[\x20]/g, '');
    if (hex.length < 16)
        return '';
    return eval(ZERO_BASE.map(function (_B_, i) {
        return ((parseInt(hex.charAt(i * 2) + hex.charAt(i * 2 + 1), 16) - _B_) & 0xF) << (MASK[i] * 4);
    }).join('+'));
}

$('#BTN_DECODE').on('click', function () {
    $('#INT').val(decode($('#HEX').val()));
    return false;
});