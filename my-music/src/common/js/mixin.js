import {mapGetters, mapMutations, mapActions} from 'vuex'
import {Config} from 'common/js/config'
import Util from 'common/js/util'

export const playerMixin = {
  computed: {
    // 播放模式
    iconMode() {
      return this.mode === Config.playMode.sequence ? 'icon-sequence' : this.mode === Config.playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playList',
      'mode',
      'favoriteHistory'
    ])
  },
  methods: {
    // 变更播放状态,更改state数据，就要提交mutation
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      console.log(mode)

      // 改变播放模式后，要变更播放列表顺序
      let list = null
      if (mode === Config.playMode.random){
        list = Util.shuffle(this.sequenceList)
      }else {
        list = this.sequenceList
      }
      // 确定更改播放模式后的当前歌曲的index
      this.resetCurrentIndex(list)
      // 提交mutation
      this.setPlayList(list)
    },
    resetCurrentIndex(list){
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getFavoriteIcon(song) {
      // if (this.isFavorite(song)) {
      //   return 'icon-favorite'
      // }
      return 'icon-not-favorite'
    },
    ...mapActions([
      'deleteFavoriteSong',
      'saveFavoriteHistory'
    ]),
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    })
  }
}