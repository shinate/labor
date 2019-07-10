import axios from 'axios'
import marked from 'marked'

marked.setOptions({
    renderer   : new marked.Renderer(),
    pedantic   : false,
    gfm        : true,
    breaks     : false,
    sanitize   : false,
    smartLists : true,
    smartypants: false,
    xhtml      : false
});

$(document).ready(function () {
    axios.get('altar.md')
        .then(function (ret) {
            $('#contents').html(marked(ret.data))
            $('#contents').find('table').addClass('table')
        })
        .catch(function (e) {
            console.warn(e);
        })
})