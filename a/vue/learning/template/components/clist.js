import Vue from "vue"
import Component from 'vue-class-component'
import WithRender from "./clist.html"

import buttonCounter from './buttonCounter'

@WithRender
@Component({
    props     : ['list'],
    components: {
        buttonCounter
    }
})

class clist extends Vue {

}

export default clist