import raf from 'raf'
import Filters from './Filters'

const Effects = {
    FD  : function (idata) {
        let data = idata.data;
        let w = idata.width;
        let limit = data.length
        // Loop through the subpixels, convoluting each using an edge-detection matrix.
        for (let i = 0; i < limit; i++) {
            if (i % 4 == 3) continue;
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + w * 4];
        }
        return idata;
    },
    gray: function (idata) {
        let data = idata.data;
        // Loop through the pixels, turning them grayscale
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            let brightness = (3 * r + 4 * g + b) >>> 3;
            data[i] = brightness;
            data[i + 1] = brightness;
            data[i + 2] = brightness;
        }
        return idata;
    }
}

let nodes = {}

let canvasEl = document.querySelectorAll('canvas')

nodes.source = document.querySelector('video')
nodes.dest = [
    canvasEl[0],
    canvasEl[1],
    canvasEl[2]
]
nodes.bg = document.createElement('canvas')

let ctx = [
    nodes.dest[0].getContext('2d'),
    nodes.dest[1].getContext('2d'),
    nodes.dest[2].getContext('2d')
]

let bgctx = nodes.bg.getContext('2d')

var cw, ch, vw, vh;
//ctx_0.translate(cw / 2, ch / 2);
//ctx_0.scale(-1, 1);
//ctx_0.translate(-cw / 2, -ch / 2);
let imageData;
const $render = () => {
    let fw, fh, ft, fl

    if (cw / ch < vw / vh) {
        fw = cw
        fh = vh * (cw / vw)
        fl = 0
        ft = (ch - fh) / 2
    } else {
        fw = vw * (ch / vh)
        fh = ch
        fl = (cw - fw) / 2
        ft = 0
    }
    bgctx.drawImage(nodes.source, fl, ft, fw, fh)
    imageData = bgctx.getImageData(0, 0, cw, ch)
    ctx[0].putImageData((function (px) {
        px = Filters.grayscale(px);
        let vertical = Filters.convoluteFloat32(px,
            [
                -1, -2, -1,
                0, 0, 0,
                1, 2, 1
            ]);
        let horizontal = Filters.convoluteFloat32(px,
            [
                -1, 0, 1,
                -2, 0, 2,
                -1, 0, 1
            ]);
        let id = Filters.createImageData(vertical.width, vertical.height);
        for (let i = 0; i < id.data.length; i += 4) {
            let v = Math.abs(vertical.data[i]);
            id.data[i] = v;
            let h = Math.abs(horizontal.data[i]);
            id.data[i + 1] = h
            id.data[i + 2] = (v + h) / 4;
            id.data[i + 3] = 255;
        }
        return id;
    })(imageData), 0, 0)
    ctx[1].putImageData(Filters.applyFilter(Filters.grayscale, imageData), 0, 0)
    ctx[2].putImageData(Filters.applyFilter(Filters.threshold, imageData, 96, [16, 128, 16]), 0, 0)
    raf($render)
}

const $resize = () => {
    cw = nodes.source.clientWidth, ch = nodes.source.clientHeight
    nodes.bg.width = cw
    nodes.bg.height = ch

    nodes.dest.forEach((canvas) => {
        canvas.width = cw
        canvas.height = ch
    })
}

nodes.source.addEventListener('play', function () {
    $resize()
    $render()
}, false);

(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).call(navigator, {
    video: true
}, function (stream) {
    let settings = stream.getVideoTracks()[0].getSettings()
    vw = settings.width
    vh = settings.height
    nodes.source.srcObject = stream;
}, function (error) {
    if (error.PERMISSION_DENIED) {
        alert('用户拒绝了浏览器请求媒体的权限');
    } else if (error.NOT_SUPPORTED_ERROR) {
        alert('constraint中指定的媒体类型不被支持');
    } else if (error.MANDATORY_UNSATISFIED_ERROR) {
        alert('指定的媒体类型未接收到媒体流');
    }
})

window.onresize = () => {
    $resize()
}

