import * as types from './mutation-types'

export const selectPlay = ({commit, state}, {list, index}) => {
  // 提交顺序播放列表
  commit(types.SET_SEQUENCE_LIST, list)
  // 提交播放列表
  commit(types.SET_PLAYLIST, list)
  // 提交当前播放index
  commit(types.SET_CURRENT_INDEX, index)
  // 提交播放状态为true
  commit(types.SET_PLAYING_STATE, true)
  // 提交全屏播放为true
  commit(types.SET_FULL_SCREEN, true)
}