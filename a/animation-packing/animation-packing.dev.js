import GIF from './lib/GIF'
import GIFParser from './lib/GIFParser'

document.querySelector('#file-input').addEventListener('change', function (e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let res = event.target.result
        let gifData = new GIF(res)
        gifData.frames.forEach(frameData => {
            let image = new Image()
            document.body.append(image)
            image.src = frameData.dataUrl
        })
    }
    reader.readAsDataURL(e.target.files[0]);
}, false);