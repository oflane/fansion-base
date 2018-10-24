/* eslint-disable no-extend-native */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import path from 'path'
/**
 * 后台请求工具
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2017-7-13
 */

if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (callback) {
    var Promise = this.constructor
    return this.then(
      function (value) {
        Promise.resolve(callback()).then(
          function () {
            return value
          }
        )
      },
      function (reason) {
        Promise.resolve(callback()).then(
          function () {
            throw reason
          }
        )
      }
    )
  }
}
/**
 * get请求头信息
 * @type {{Accept: string, Content-Type: string}}
 */
const defaultHeaders = {
  'Accept': 'application/x-www-form-urlencoded',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
}

const jsonHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json; charset=UTF-8'
}
/**
 *
 * @param data [Object] json格式的对象
 * @returns {string} 拼接好的formData格式字符串
 */
export const toParameters = (data, prefix = '') => prefix + Object.entries(data).map(([k, v]) => !v ? undefined : Array.isArray(v) ? v.map(vi => vi ? k + '=' + vi : undefined).join('&') : k + '=' + v).join('&')

/**
 * rest url参数提取正则
 * @type {RegExp}
 */
const REG_URLPATTERN = /\/:(\w+)/g

/**
 * 提取url中的参数名
 * @param url 需要提取的url
 * @returns {Array}
 */
export const parseRestPath = url => {
  let rs = []
  let result
  while ((result = REG_URLPATTERN.exec(url)) != null) {
    if (result[1]) {
      rs.push(result[1])
    }
  }
  return rs
}
/**
 * 提取url中的参数名
 * @param url 需要提取的url
 * @returns {Array}
 */
export const fillRestPath = (url, data) => {
  parseRestPath(url).forEach(p => {
    url = url.replace(':' + p, data[p])
  })
  return url
}
/**
 * 增加rest请求的上下问路径
 * @param url {string} 请求地址
 * @return {string} 转换后路径
 */
export const getRestUrl = (url) => path.join(window.$restContext, url)
/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @returns {Promise.<*>} 异步加载对象
 */
export const getJson = (url, params = {}) => sendRequestJson(getRestUrl(url), params, 'GET')

/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @returns {Promise.<*>} 异步加载对象
 */
export const getText = (url, params = {}) => sendRequestText(getRestUrl(url), params, 'GET')

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Object} 返回json
 */
export const post = (url, params = {}) => sendRequestJson(getRestUrl(url), params, 'POST')

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Object} 返回文本
 */
export const post2Text = (url, params = {}) => sendRequestText(getRestUrl(url), params, 'POST')

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Object} 返回json
 */
export const postJson = (url, params = {}) => sendRequestJson(getRestUrl(url), params, 'JSON')

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Object} 返回文本
 */
export const postJson2Text = (url, params = {}) => sendRequestText(getRestUrl(url), params, 'JSON')
/**
 *
 * @param url [String] 请求地址
 * @param params [Object] 携带的数据
 * @param type [String] 方法 默认'get'支持'post'、'delete'
 * @returns {Promise.<*>}
 */
export const sendRequestJson = async (url, params = {}, type = 'GET') => (await sendRequest(url, params, type)).json()

/**
 *
 * @param url [String] 请求地址
 * @param params [Object] 携带的数据
 * @param type [String] 方法 默认'get'支持'post'、'delete'
 * @returns {Promise.<*>}
 */
export const sendRequestText = async (url, params = {}, type = 'GET') => (await sendRequest(url, params, type)).text()
/**
 *
 * @param url [String] 请求地址
 * @param params [Object] 携带的数据
 * @param type [String] 方法 默认'get'支持'post'、'delete'
 * @returns {Promise.<*>}
 */
export const sendRequest = async (url, params = {}, type = 'GET', header) => {
  if (!url) {
    throw new Error('url is null')
  }
  if (type.toUpperCase() === 'GET') {
    const length = Object.keys(params).length
    if (length) {
      url = `${url}${toParameters(params, '?')}`
    }
  }
  let headers
  let isJson = false
  if (type.toUpperCase() === 'JSON') {
    isJson = true
    headers = header ? Object.assign({}, jsonHeaders, header) : jsonHeaders
    type = 'POST'
  } else {
    headers = header ? Object.assign({}, defaultHeaders, header) : defaultHeaders
  }
  let requestConfig = {
    credentials: 'include',
    method: type,
    headers,
    mode: 'cors',
    cache: 'no-cache'
  }
  if (type.toUpperCase() === 'POST') {
    Object.defineProperty(requestConfig, 'body', {
      value: isJson ? JSON.stringify(params) : toParameters(params)
    })
  }
  try {
    return await fetch(url, requestConfig)
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * 生成promise请求对象
 * @param url [String] 请求地址
 * @param params [Object] 携带的数据
 * @param type [String] 方法 默认'get'支持'post'、'delete'
 * @returns {Promise.<*>}
 */
export const createRequest = (url, params = {}, type = 'GET', header) => {
  if (!url) {
    throw new Error('url is null')
  }
  if (type.toUpperCase() === 'GET') {
    const length = Object.keys(params).length
    if (length) {
      url = `${url}${toParameters(params, '?')}`
    }
  }
  let headers
  let isJson = false
  if (type.toUpperCase() === 'JSON') {
    isJson = true
    headers = header ? Object.assign({}, jsonHeaders, header) : jsonHeaders
    type = 'POST'
  } else {
    headers = header ? Object.assign({}, defaultHeaders, header) : defaultHeaders
  }
  let requestConfig = {
    credentials: 'include',
    method: type,
    headers,
    mode: 'cors',
    cache: 'force-cache'
  }
  if (type.toUpperCase() === 'POST') {
    Object.defineProperty(requestConfig, 'body', {
      value: isJson ? JSON.stringify(params) : toParameters(params)
    })
  }
  return fetch(url, requestConfig)
}
