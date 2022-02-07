import Vue from 'vue';

import VueRouter from 'vue-router';
import router from './router';
import Index from './Index';

Vue.router = router;
Vue.use(VueRouter);

if (window.location.href.indexOf('test') > -1 || window.location.href.indexOf('ost:') > -1)
    new Vue({
        render: h => h(Index),
        el: '#app',
        router
    });
