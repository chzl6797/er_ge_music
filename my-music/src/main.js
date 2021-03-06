import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import fastclick from 'fastclick'

// 入口文件引入公共样式
import 'common/stylus/index.styl'

// 整个PC所有body下的dom点击都不会有300毫秒延迟
fastclick.attach(document.body)
 
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
