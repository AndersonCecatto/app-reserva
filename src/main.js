import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { VueMaskDirective } from 'v-mask'

Vue.config.productionTip = false
Vue.directive('mask', VueMaskDirective);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
