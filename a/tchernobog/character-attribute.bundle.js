var ZERO_BASE = [0xF1, 0x52, 0x49, 0xE9, 0xAE, 0xF1, 0x90, 0xBB];
var MASK = [4, 1, 3, 7, 0, 5, 2, 6];

function encode(value) {
    if (value > -0x80000000 && value < 0xFFFFFFFF) {
        value = parseInt(value) & 0xFFFFFFFF;
        return ZERO_BASE.map(function (_B_, i) {
            var mask = MASK[i] * 4;
            return ('0' + (((((0xF << mask) & value) >> mask) + _B_) & 0xFF).toString(16).toUpperCase()).slice(-2);
        }).join(' ');
    }

    return null;
}

$('#BTN_ENCODE').on('click', function () {
    var value = $('#INT').val().trim();
    if (value !== '') {
        var res = encode(value);
        if (res != null) {
            $('#HEX').val(res);
            updateEqual(value);
            return false;
        }
    }
    $('#HEX').val('');
    updateEqual(null);
    return false;
});

function decode(hex) {
    var hex = hex.replace(/[\x20]/g, '');
    if (hex.length >= 16) {
        return eval(ZERO_BASE.map(function (_B_, i) {
            return ((parseInt(hex.charAt(i * 2) + hex.charAt(i * 2 + 1), 16) - _B_) & 0xF) << (MASK[i] * 4);
        }).join('+'));
    }
    return null;
}

$('#BTN_DECODE').on('click', function () {
    var value = $('#HEX').val().trim();
    if (value !== '') {
        var res = decode(value)
        if (res != null) {
            $('#INT').val(res);
            updateEqual(res);
            return false;
        }
    }
    $('#INT').val('');
    updateEqual(null);
    return false;
});

var equal = $('<div class="input-group-append equal"><span class="input-group-text"></span></div>')

function updateEqual(value) {
    if (value == null) {
        equal.remove();
    } else {
        equal.find('> span').html('<span>' + [
                '<i class="int">' + (new Int32Array([value])).toString() + '</i>',
                '<i class="uint">' + (new Uint32Array([value])).toString() + '</i>'
            ].join('<br>') + '</span>');
        $('#INT').after(equal);
    }
}