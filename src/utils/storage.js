/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

/**
 * 对localstorge访问封装
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2010/18/18
 */
export default {

  /**
   * 存储localStorage
   * @param key 缓存键值
   * @param value 缓存数据
   */
  set: (key, value) => {
    if (!key) return
    if (typeof (value) !== 'string') {
      value = JSON.stringify(value)
    }
    window.localStorage.setItem(key, value)
  },
  /**
   * 获取localStorage存储值
   * @param key 缓存键值
   * @return {string} 数据
   */
  get: key => {
    if (!key) return
    return window.localStorage.getItem(key)
  },
  /**
   * 删除localStorage中的缓存
   * @param key 缓存键值
   */
  remove: key => {
    if (!key) return
    window.localStorage.removeItem(key)
  }
}
