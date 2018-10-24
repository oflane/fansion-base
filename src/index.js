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
  comps.page.init(option.page)
  comps.dialogOpeners.init(option.dialogs)
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
