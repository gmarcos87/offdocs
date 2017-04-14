import Vue from 'vue';
import VueMaterial from 'vue-material';
import InfiniteLoading from 'vue-infinite-loading'

import App from './src/app.vue'


let packageList;

Vue.use(VueMaterial)


Vue.component('InfiniteLoading',InfiniteLoading)

new Vue({
  el: "#app",
  render: h => h(App)
});


