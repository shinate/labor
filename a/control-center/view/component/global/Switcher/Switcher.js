import Vue from "vue"
import Component from 'vue-class-component'
import WithRender from "./Switcher.html"

@WithRender
@Component

export default class Switcher extends Vue {
    trigger() {
        console.log(this)
    }
}