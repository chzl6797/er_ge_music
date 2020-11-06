import {commonParams, options} from './config'
import jsonp from 'common/js/jsonp'
import axios from 'axios'

export function getRecommend() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_first_yqq.fcg'

  const data = Object.assign({}, commonParams, {
    format: 'jsonp',
    tpl: 'v12',
    page: 'other',
    rnd: 0,
    g_tk: new Date().getTime(),
    loginUin: 0,
    hostUin: 0,
    inCharset: 'utf8',
    outCharset: 'GB2312',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0
  })
  return jsonp(url, data, options)
}

/**
 * 获取歌单数据
 */
export function getDiscList() {
  const url = '/api/getDiscList'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    // 这里返回一个Promise的resolve方法，把需要的参数传递出去
    return Promise.resolve(res.data)
  })
}