import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

// vuex的应用场景： 1、多组件间的状态和数据共享； 2、路由间的复杂数据传递
Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations
})
