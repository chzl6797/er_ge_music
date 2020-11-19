<template>
  <div class="recommend" ref="recommend">
    <!-- 在这一层做引用，初始化BScroll，数据加载后在渲染，要记得加上data -->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <!-- 从服务端加载数据，会有延迟，等抓到数据后，在加载slider组件，这样slider里的mounted周期就能拿到数据了 -->
        <div class="slider-wrapper" v-if="banners.length">
          <slider>
            <!-- slider组件里面的插槽 -->
            <div v-for="(item, index) in banners" :key="index">
              <a href="/">
                <img @load="loadImg" :src="item.pic" class="needsclick" alt="">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item,index) in discList" class="item" :key="index">
              <div class="icon">
                <img v-lazy="item.imgurl" width="60" height="60">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Slider from 'base/slider/slider'
  import {getDiscList, getRecommend} from 'api/recommend'

  export default {
    data() {
      return {
        banners: [],
        discList: []
      }
    },
    components: {
      Scroll,
      Slider
    },
    created() {
      this._getRecommed()
      this._getDiscList()
    },
    methods:{
      async _getRecommed() {
        try {
          const {data} = await getRecommend()
          this.banners = data.focus,
          console.log(this.banners)
        } catch (error) {
          console.log(error)
        }
      },
      /**
     * 监听到banner图加载后，重新计算scrool的高度
     */
    loadImg() {
      // 一张图片渲染就行了
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },
      async _getDiscList() {
        try {
          const {data} = await getDiscList()
          this.discList = data.list
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
