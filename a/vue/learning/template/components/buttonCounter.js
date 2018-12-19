import Vue from "vue"
import Component from 'vue-class-component'
import WithRender from "./buttonCounter.html"

@WithRender
@Component({
    props: ['c']
})

class buttonCounter extends Vue {
    count = 0

    append() {
        this.count++
    }
}

export default buttonCounter