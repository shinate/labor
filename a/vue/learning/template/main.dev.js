import Vue from "vue"
// import buttonCounter from "./components/buttonCounter"
import clist from "./components/clist"

new Vue({
    el        : '#components-demo',
    data      : {
        cl  : [
            '1', '2', '3'
        ]
    },
    components: {
        clist
    }
});