import Vue from "vue"
import Component from 'vue-class-component'
import WithRender from "./Switcher.html"

@WithRender
@Component({
    props: ['value'],
    data : function () {
        return {
            val: this.value
        }
    }
})

export default class Switcher extends Vue {
    trigger() {
        console.log(this.val)
        this.val = !this.val
    }
}