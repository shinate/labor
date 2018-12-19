const Filters = {}

Filters.getPixels = function (img) {
    if (img instanceof ImageData) {
        return img
    } else if (img instanceof Image) {
        let c, ctx;
        if (img.getContext) {
            c = img;
            try {
                ctx = c.getContext('2d');
            } catch (e) {
            }
        }
        if (!ctx) {
            c = this.getCanvas(img.width, img.height);
            ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
        }
    }
}

Filters.getCanvas = function (w, h) {
    let c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
}

Filters.applyFilter = function (filter, image, ...args) {
    return filter.apply(null, [].concat([this.getPixels(image)], args));
}

Filters.gray = function (pixels) {
    let data = pixels.data;
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
    return pixels;
}

Filters.grayscale = function (pixels) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];
        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels;
}

Filters.grayscale = function (pixels, args) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];
        // CIE luminance for the RGB
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels;
};

Filters.brightness = function (pixels, adjustment) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        d[i] += adjustment;
        d[i + 1] += adjustment;
        d[i + 2] += adjustment;
    }
    return pixels;
};

Filters.threshold = function (pixels, threshold, fillWith = [255, 255, 255]) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];
        if (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) {
            d[i] = fillWith[0]
            d[i + 1] = fillWith[1]
            d[i + 2] = fillWith[2]
        } else {
            d[i] = d[i + 1] = d[i + 2] = 0
        }
    }
    return pixels;
};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function (w, h) {
    return this.tmpCtx.createImageData(w, h);
};

Filters.convolute = function (pixels, weights, opaque) {
    let side = Math.round(Math.sqrt(weights.length));
    let halfSide = Math.floor(side / 2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageData(w, h);
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let sy = y;
            let sx = x;
            let dstOff = (y * w + x) * 4;
            let r = 0, g = 0, b = 0, a = 0;
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    let scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                    let scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                    let srcOff = (scy * sw + scx) * 4;
                    let wt = weights[cy * side + cx];
                    r += src[srcOff] * wt;
                    g += src[srcOff + 1] * wt;
                    b += src[srcOff + 2] * wt;
                    a += src[srcOff + 3] * wt;
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    return output;
};

if (!window.Float32Array)
    Float32Array = Array;

Filters.convoluteFloat32 = function (pixels, weights, opaque) {
    let side = Math.round(Math.sqrt(weights.length));
    let halfSide = Math.floor(side / 2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = {
        width: w, height: h, data: new Float32Array(w * h * 4)
    };
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let sy = y;
            let sx = x;
            let dstOff = (y * w + x) * 4;
            let r = 0, g = 0, b = 0, a = 0;
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    let scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                    let scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                    let srcOff = (scy * sw + scx) * 4;
                    let wt = weights[cy * side + cx];
                    r += src[srcOff] * wt;
                    g += src[srcOff + 1] * wt;
                    b += src[srcOff + 2] * wt;
                    a += src[srcOff + 3] * wt;
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    return output;
};

export default Filters