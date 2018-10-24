/* eslint-disable no-extend-native */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

/**
 * 字符串扩展
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
/**
 * 将字符串名称由驼峰模式转为下划线形式
 * @returns {string} 结果串
 */
String.prototype.toUnderLine = function () {
  return this.replace(/[A-Z]/g, (match, pos) => (pos > 0 ? '_' : '') + match.toLowerCase())
}
/**
 * 将字符串名称由驼峰模式转为横线形式
 * @returns {string} 结果串
 */
String.prototype.toDash = function () {
  return this.replace(/[A-Z]/g, (match, pos) => (pos > 0 ? '-' : '') + match.toLowerCase())
}

/**
 * 将字符串首字母大写
 * @returns {string} 结果串
 */
String.prototype.toCapitalize = function () {
  return this.charAt(0).toUpperCase() + this.substr(1)
}
/**
 * 名称转化方法将-间隔名称转换为驼峰是命名
 * @return {string}  结果串
 */
String.prototype.toClassify = function () {
  return this.replace(/(?:^|[-_])(\w)/g, c => c.toUpperCase()).replace(/[-_]/g, '')
}

/**
 * 将字符串名称由下划线形式转为驼峰模式
 * @returns {string} 结果串
 */
String.prototype.toCamelCase = String.prototype.toClassify
/**
 * 去掉左空格
 * @param _
 * @returns {*}
 */
String.prototype.ltrim = function () {
  return this.replace(/^[\s\n\t]+/g, '')
}

/**
 * 去掉右空格
 * @param _
 * @return {*}
 */
String.prototype.rtrim = function () {
  return this.replace(/[\s\n\t]+$/g, '')
}

/**
 * 去掉两头空格
 * @param _
 * @returns {*}
 */
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '')
}
