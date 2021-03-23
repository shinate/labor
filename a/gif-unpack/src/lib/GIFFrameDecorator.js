class GifFramesRender {
    constructor(imageParsedData) {
        this.data = imageParsedData
        this.canvas = document.createElement('canvas')
        this.canvas.setAttribute('width', this.data.width)
        this.canvas.setAttribute('height', this.data.height)
        this.ctx = this.canvas.getContext('2d')

        // document.body.appendChild(this.canvas)

        this.draw()
        this.ctx = this.canvas = null
    }

    draw() {
        this.data.frames = this.data.frames.map(frameData => {
            let transparentIndex = frameData.transparentIndex
            for (let y = 0; y < frameData.height; y++) {
                for (let x = 0; x < frameData.width; x++) {
                    let offset = (y * frameData.width + x)
                    let colorIndex = frameData.data[offset]
                    if (transparentIndex === colorIndex) {
                        continue
                    }
                    let color = (frameData.palette || this.data.palette)[colorIndex]
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

export default function (...args) {
    return new GifFramesRender(...args)
}