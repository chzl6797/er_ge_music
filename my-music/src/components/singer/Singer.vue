<template>
  <div class="singer" ref="singer">
    <list-view :data="singers" ref="list"></list-view>
  </div>
</template>

<script>
  import {getSingerList} from 'api/singer'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'

  const HOT_SINGER_LEN = 10
  const HOT_NAME = '热门'

  export default {
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      async _getSingerList() {
        try {
         const {data:{list}} = await getSingerList()
        //  console.log(list)
         this.singers = this._normalizeSinger(list)
         console.log(this.singers)
         console.log()
        } catch (error) {
          console.log(error)
        }
      },
      // 处理后端的API数据
      _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items:[]
        }
      }

      list.forEach((item, index) => {
        if(index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        }
        // 获取元素的第一个字母,并判断是否等于9，如果是的话返回hot
        const key = item.Findex != '9' ? item.Findex : 'hot'
        // 判断字母是否存在，不存在则添加
        if(!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
        }))
      })

      // 处理map对象，得到ret和hot列表
      let ret = []
      let hot = []
      for (const key in map) {
        let val = map[key]
        if(val.title.match(/[a-zA-Z]/)){
          ret.push(val)
        }else {
          hot.push(val)
        }
      }

      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })

      return hot.concat(ret)
      }
    },
    components: {
      ListView
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position fixed
    top 88px
    bottom 0
    width 100%
</style>