/* eslint-disable no-extend-native */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

/**
 * 日期工具类
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-1-26
 */

Date.prototype.format = function (format) {
  let o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    'S': this.getMilliseconds()
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  Object.entries(o).forEach(([k, v]) => {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  })
  return format
}
