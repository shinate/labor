import Vue from "vue"
import Component from 'vue-class-component'
import WithRender from "./buttonCounter.html"

@WithRender
@Component

class buttonCounter extends Vue {
    count = 0

    append() {
        this.count++
    }
}

export default buttonCounter