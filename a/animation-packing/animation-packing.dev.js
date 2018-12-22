import gif from './lib/gif'
import GIFParser from './lib/GIFParser'

document.querySelector('#file-input').addEventListener('change', function (e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let res = event.target.result
        console.log(new gif(res))
        console.log(GIFParser(res))
    }
    reader.readAsDataURL(e.target.files[0]);
}, false);