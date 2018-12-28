import Vue from "vue"
import Component from 'vue-class-component'
import WithRender from "./CinemaList.html"

@WithRender
@Component({
    props: ['tms'],
    data : function () {
        return this.tms
    }
})

export default class CinemaList extends Vue {

}