<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <!-- <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div> -->
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 往上滑的遮罩层 -->
    <div class="bg-layer" ref="layer"></div>
    <!-- 派发的scroll事件 -->
    <scroll :data="songs" @scroll="scroll" :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <div class="song-list-wrapper">
        <!-- 派发的select事件 -->
        <song-list :songs="songs" :rank="rank"></song-list>
      </div>
    </scroll>
  </div>
</template>


<script>
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list.vue'

  const RESERVED_HEIGHT = 40

export default {
  props:{
    title: {
        type: String,
        default: ''
    },
    songs: {
        type: Array,
        default: []
      },
    bgImage: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
  },
  data() {
    return {
      scrollY: 0, //songlist偏移量
      minTransalteY: 0
    }
  },
  created() {
    // 可以监听快速滑动的位置
    this.probeType = 3
    // 需要监听滚动
    this.listenScroll = true
  },
  methods: {
    // 返回上级
    back() {
      this.$router.back()
    },
    scroll(scrollY) {
      this.scrollY = scrollY
    }
  },
  mounted() {
    // 记录一下歌手图片的高度，263
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  computed: {
    bgStyle() {
      return `background-image:url(${this.bgImage})`
    }
  },
  watch: {
    scrollY(newY) {
      const newVal = newY.y 
      const transformY = Math.max(this.minTransalteY, newVal)

      // 图片的缩放，默认为1
      let scale = 1
      // 歌手图片的z-lindex
      let zIndex = 0

      const percent = Math.abs(newVal/this.imageHeight)

      // bglayer层跟着歌曲向上滑动
      this.$refs.layer.style['transform'] = `translate3d(0,${transformY}px,0)`
      this.$refs.layer.style['webkit-transform'] = `translate3d(0,${transformY}px,0))`

      if(newVal < this.minTransalteY) {
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
      }else {
        zIndex = 0
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = '0'
      }

      if(newVal > 0) {
        scale = 1 + percent
        zIndex = 10
      }
      
      this.$refs.bgImage.style['transform'] = `scale(${scale})`
      this.$refs.bgImage.style['webkit-transform'] = `scale(${scale})`
      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  components: {
    Scroll,
    SongList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
