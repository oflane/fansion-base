/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

import { getJson } from '~/utils/rest'

/**
 * 数据加载插件
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2017-8-24
 */
export default class DataLoader {
  /**
   * 构造方法
   * @param url 数据加载的url
   * @param page 页面对象
   * @param model 模型对象
   * @param success 回调
   * @param error 错误回调
   * @param finalCallBack 执行回调
   */
  constructor (url, page, model, success, error, finalCallBack) {
    this.url = url
    this.plugs = []
    this.parameters = {}
    this.page = page
    this.model = model
    this.success = success
    this.error = error
    this.finalCallBack = finalCallBack
  }

  /**
   * 添加插件
   * @param plugin
   */
  addPlugin (plugin) {
    this.plugs.push(plugin)
  }

  /**
   * 设置加载url
   * @param url 加载数据的url
   */
  setUrl (url) {
    this.url = url
  }

  /**
   * 设置固定的加载参数
   * @param key 参数家宅
   * @param parameters 参数对象
   * @param load 布尔值是否出发加载操作
   */
  setParameter (name, value, load = true) {
    this.parameters[name] = value
    if (load) {
      this.load()
    }
  }
  load (reset = false) {
    let plugs = this.plugs
    if (reset) {
      plugs.forEach(p => p.reset && p.reset())
    }
    let parameters = {}
    Object.assign(parameters, this.parameters, ...plugs.map(p => p.getParameters && p.getParameters()))
    let _self = this
    return getJson(this.url, parameters).then(res => {
      if (_self.model) {
        let keys = _self.model.split('.')
        let p = _self.page
        keys.forEach((key, i) => {
          if (i === keys.length - 1) {
            p[key] = res
          } else {
            p = p[key]
          }
        })
      }
      _self.success && _self.success.call(_self.page, res)
      plugs.forEach(p => p.refreshData && p.refreshData(res))
    }).catch(err => {
      _self.error && _self.error(err)
    }).finally(() => {
      _self.finalCallBack && _self.finalCallBack.call(_self.page)
    })
  }
}
