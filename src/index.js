/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import utils from './utils'
import mixins from './mixins'
import comps from './comps'

/**
 * 版本号
 * @type {string}
 */
const version = '1.0.0'

/**
 * 初始化方法
 * @param option
 * @returns {*}
 */
const init = (option) => {
  if (!option) {
    return
  }
  option.pages && comps.pages.init(option.pages)
  option.router && comps.route.init(option.router)
  option.dialogs && comps.dialog.init(option.dialogs)
  option.store && comps.store.init(option.store)
  option.urls && utils.urls.init(option.urls)
  option.rest && utils.rest.init(option.rest)
}

/**
 * fansion基础工具包
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export default {
  version,
  ...utils,
  mixins,
  ...comps,
  init
}
