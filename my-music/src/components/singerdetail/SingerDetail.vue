<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/MusicList.vue'
  import {getSingerDetail} from 'api/singer.js'
  import {createSong} from 'common/js/song.js'
  import {mapGetters} from 'vuex'

  export default {
    data() {
      return {
        songs: []
      }
    },
    components: {
      MusicList
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created() {
      this._getDetail()
    },
    methods: {
      async _getDetail() {
        // 限制不能直接点击歌手详情页
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        const res = await getSingerDetail(this.singer.id)
        this.songs = this._normalizeSongs(res.data.list)
        console.log(this.songs)
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          // 解构赋值
          let {musicData} = item
          // 歌曲id和专辑id必须有，工厂模式,list是由一大推Song对象组成的，所以Song对象下的函数，currentSong可以调用
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>