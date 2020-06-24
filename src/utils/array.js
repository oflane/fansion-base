/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

/* eslint-disable no-extend-native */
/**
 * 数组扩展
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
/**
 * 返回返回第一个非空果
 * @returns {string} 结果串
 */
Array.prototype.firstNotNull = function (f) {
  for (let i = 0; i < this.length; i++) {
    const r = f(this[i])
    if (r) {
      return r
    }
  }
}
