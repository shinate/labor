import gif from './lib/gif'
import GIFParser from './lib/GIFParser'

document.querySelector('#file-input').addEventListener('change', function (e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let res = event.target.result
        let gifData = new gif(res)

        new GifSetRender(gifData)
        gifData.frames.forEach(frameData => {
            let image = new Image()
            document.body.append(image)
            image.src = frameData.dataUrl
        })
    }
    reader.readAsDataURL(e.target.files[0]);
}, false);

class GifSetRender {

    canvas
    context
    data

    constructor(imageParsedData) {
        this.data = imageParsedData
        this.canvas = document.createElement('canvas')
        this.canvas.setAttribute('width', this.data.width)
        this.canvas.setAttribute('height', this.data.height)
        this.ctx = this.canvas.getContext('2d')

        // document.body.appendChild(this.canvas)

        this.draw()
    }

    draw() {
        this.data.frames = this.data.frames.map(frameData => {
            for (let y = 0; y < frameData.height; y++) {
                for (let x = 0; x < frameData.width; x++) {
                    let offset = (y * frameData.width + x)
                    let color = frameData.localPalette[frameData.data[offset]]
                    let r = color[0], g = color[1], b = color[2]
                    this.ctx.fillStyle = `rgb(${r},${g},${b})`
                    this.ctx.fillRect(x + frameData.offsetX, y + frameData.offsetY, 1, 1);
                }
            }
            frameData.imageData = this.ctx.getImageData(0, 0, this.data.width, this.data.height)
            frameData.dataUrl = this.canvas.toDataURL('image/png')
            return frameData
        })
    }
}