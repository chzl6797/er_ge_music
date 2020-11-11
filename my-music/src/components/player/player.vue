<template>
  <div class="player" ref="player">
    <transition name="normal">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
            <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
          @touchstart="middleTouchStart"
          @touchmove="middleTouchMove"
          @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
              <div class="cd-wrapper">
                <div class="cd" >
                  <img class="image" :class="cdClass" :src="currentSong.image">
                </div>
              </div>
                <div class="playing-lyric-wrapper">
                  <div class="playing-lyric">
                    {{playingLyric}}
                  </div>
                </div>
           </div>
           <!-- 如果初始化的时候传入的props是null，就这么写，obj&&obj.a -->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" :class="{'current' : currentLyricLineNum === index}" v-for="(line,index) in currentLyric.lines" :key="line.time" ref="lyricLine" >{{line.txt}}</p>
              </div>
              <div class="pure-music">
                <p></p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
            <div class="dot-wrapper">
              <span class="dot" :class="{'active' : currentPageShow === 'cd'}"></span>
              <span class="dot" :class="{'active' : currentPageShow === 'lyric'}"></span>
            </div>
            <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                <progress-bar ref="progressBar" :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
              </div>
              <span class="time time-r">{{format(currentSong.duration)}}</span>
            </div>
            <div class="operators">
              <div class="icon i-left" @click="changeMode">
                <i :class="iconMode"></i>
              </div>
              <div class="icon i-left" :class="disableClass">
                <i @click="prev" class="icon-prev"></i>
              </div>
              <div class="icon i-center" :class="disableClass">
                <i :class="playIcon" @click="togglePlaying"></i>
              </div>
              <div class="icon i-right" :class="disableClass">
                <i @click="next" class="icon-next"></i>
              </div>
              <div class="icon i-right">
                <i class="icon" :class="getFavoriteIcon(currentSong)"></i>
              </div>
            </div>
          </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img width="40" height="40" :class="cdClass" :src="currentSong.image">
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
      </div>
    </transition>
     <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="timeUpdate" @ended="end"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import {playerMixin} from 'common/js/mixin'
  import {Config} from 'common/js/config'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import Scroll from 'base/scroll/scroll'
  import { prefixStyle } from 'common/js/dom'
  import Lyric from 'lyric-parser'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins:[playerMixin],
    components: {
      ProgressBar,
      Scroll
    },
    data() {
      return {
        songReady: false,// 歌曲加载完毕再播放
        currentPageShow: 'cd', // 初始cd页面显示
        currentTime: 0, // 当前播放事件
        touch: {}, // 左右滑动的touch对象
        currentLyric: null,
        currentLyricLineNum: 0, // 当前播放歌词行数
        playingLyric: '' // 当前歌词
      }
    },
    methods: {
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      error() {
        this.songReady = true
      },
      end() {
        // 如果是单曲循环
        if (this.mode === Config.playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      timeUpdate(event) {
        this.currentTime = event.target.currentTime
      },
      onProgressBarChange(persent) {
        const currentTime = this.currentSong.duration * persent
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
      },
      format(interval) {
        interval =  interval | 0
        const minute = interval / 60 | 0
        const second = (interval % 60).toString().padStart(2, '0')
        return `${minute}:${second}`
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      },
      togglePlaying() {
        if(!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      middleTouchStart(event) {
        console.log(event)
        this.touch.inited = true
        // 第一次按下的X轴、Y轴的坐标
        const touch = event.touches[0]
        this.touch.startY = touch.pageY
        this.touch.startX = touch.pageX
        // 用来判断是否是一次移动
        this.touch.moved = false
      },
      middleTouchMove(event) {
        if (!this.touch.inited) {
          return
        }
        const touch = event.touches[0]
        // 当前的defferX，defferY
        const defferX = touch.pageX - this.touch.startX
        const defferY = touch.pageY - this.touch.startY
        // 如果y轴的滑动范围大于x轴的滑动范围，说明是歌词的scroll组件在滚动，不操作
        if (Math.abs(defferY) > Math.abs(defferX)) {
          return
        }
        if (!this.touch.moved) {
          this.touch.moved = true
        }
        // 歌词页的left属性，如果当前是cd页，那么歌词页就在屏幕右边，left为0，如果被滑到屏幕当前页了，那么left就是负的屏幕宽
        const left = this.currentPageShow === 'cd' ? 0 : -window.innerWidth
        // 计算右歌词页变更的偏移量
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + defferX))
        // 计算touch的偏移的百分比
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        // ，然后操作dom执行
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      },
      middleTouchEnd(evnet) {
        if (!this.touch.moved) {
          return
        }
        let offsetWidth
        let opacity
        const time = 300
        // 如果当前页是cd页
      if (this.currentPageShow === 'cd') {
        // 如果偏移百分比大于20%
        if (this.touch.percent > 0.2) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentPageShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      }else {
        if (this.touch.percent < 0.8) {
          offsetWidth = 0
          opacity = 1
          this.currentPageShow = 'cd'
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.inited = false
      },
      prev() {
        if(!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
          return
        }else {
          let index = this.currentIndex - 1
          if(index === -1) {
            index = this.playList.length
          }
          this.setCurrentIndex(index)
          if(!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      next() {
        if(!this.songReady) {
          return
        }
        if(this.playList.length === 1) {
          this.loop()
          return
        }else {
          let index = this.currentIndex + 1
          if(index === this.playList.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if(!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      ready() {
        this.songReady = true
      },
      getLyric() {
        // 这里currentSong能调用Song类下的方法，是因为songList是由一堆Song对象组成的
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
              return
          }
          // 歌词变动一下就触发handleLyric回调函数
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          console.log(this.currentLyric)
          if (this.playing && this.songReady) {
          // 这个时候有可能用户已经播放了歌曲，要切到对应位置
          const currentTime = this.currentSong.duration * this.percent * 1000
          this.currentLyric.seek(currentTime)
        }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLyricLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {
        // this hanlder called when lineNum change
        this.currentLyricLineNum = lineNum

        // 第五行之后固定到中间
        if (lineNum > 5) {
          let lyricEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lyricEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }

        this.playingLyric = txt
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE'
      })
    },
    watch: {
      // 当前歌曲信息加载就开始播放
    currentSong(newSong, oldSong) {
      // 如果播放列表删除完了，currentSong发生改变，这种情况不播放
      if(!newSong.id) {
        return
      }
      if(newSong.id === oldSong.id) {
        return
      }
      // 如果上一首歌的歌词还有就停了
      if (this.currentLyric) {
        this.currentLyric.stop()
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLyricLineNum = 0
      }
      // 一般这种会都次调用setTimeout的情况，都要做一下初始化清理工作
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
      playing(status) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          status ? audio.play() : audio.pause()
        })
      }
    },
    computed: {
      // 进度条百分比
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      // cd转圈
      cdClass() {
        return this.playing ? 'play' : 'play pause'
      },
      // 播放按钮切换
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
       // 如果歌曲还没准备好，那么按钮先别点呢 ^_^
      disableClass() {
        return this.songReady ? '' : 'disable'
      },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    }
  }
</script>


<style scoped lang="stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation: rotate 20s linear infinite
              .pause
                animation-play-state: paused
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused  // 动画暂停
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
