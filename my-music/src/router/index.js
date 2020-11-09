import Vue from 'vue'
import VueRouter from 'vue-router'

import Recommend from 'components/recommend/Recommend.vue'
import Singer from 'components/singer/Singer.vue'
import Search from 'components/search/Search.vue'
import Rank from 'components/rank/Rank.vue'
import SingerDetail from 'components/singerdetail/SingerDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect: '/recommend'
  },
  {
    path:'/recommend',
    component:Recommend
  },
  {
    path:'/singer',
    component:Singer,
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path:'/search',
    component:Search
  },
  {
    path:'/rank',
    component:Rank
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
