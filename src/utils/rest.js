/* eslint-disable no-extend-native */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import path from 'path'
import {message, isEmptyObject, error, empty} from './util'
/**
 * 后台请求工具
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2017-7-13
 */
/* 当promise不支持final时为其扩展此方法 */
!Promise.prototype.finally && (Promise.prototype.finally = callback => {
  const Promise = this.constructor && this.then(value => Promise.resolve(callback()).then(_ => value), reason => Promise.resolve(callback()).then(_ => error(reason)))
})

/**
 * isEmptyObject
 * 请求错误时不做提示的标志参数
 * @type {string}
 */
const SILENCE = {__silence: 1}
/**
 * 请求错误时不做提示的标志参数名
 * @type {string}
 */
const SILENCE_KEY = '__silence'
/**
 * 默认的header信息
 * @type {{Accept: string, Content-Type: string}}
 */
const defaultHeaders = {
  Accept: 'application/x-www-form-urlencoded',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
}

/**
 * json请求的头信息
 * @type {{Accept: string, 'Content-Type': string}}
 */
const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json; charset=UTF-8'
}
/**
 * 设置不提示的参数
 * @param param 需要处理的参数对象
 * @returns {string}
 */
export const silence = (param) => param ? Object.assign(param, SILENCE) : SILENCE
/**
 *
 * @param data [Object] json格式的对象
 * @returns {string} 拼接好的formData格式字符串
 */
export const toParameters = (data, prefix = '') => prefix + Object.entries(data).map(([k, v]) => !v ? undefined : Array.isArray(v) ? v.map(vi => vi ? k + '=' + vi : undefined).join('&') : k + '=' + encodeURIComponent(v)).join('&')

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
  const rs = []
  let result
  while ((result = REG_URLPATTERN.exec(url)) != null) {
    if (result[1]) {
      rs.push(result[1])
    }
  }
  return rs
}

/**
 * 提取url中的参数名,进行填充
 * @param url {String} 需要提取的url
 * @param data {Array} 填充数据
 * @returns 填充后url串
 */
export const fillUrl = (url, data) => {
  parseRestPath(url).forEach(p => {
    url = url.replace(':' + p, encodeURIComponent(data[p]))
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
 * @returns {Promise<any>} 异步加载对象
 * @param cb 回调方法
 */
export const gson = (url, params = {}, cb = empty) => getJson(url, params).then(cb)
/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @returns {Promise.<*>} 异步加载对象
 */
export const getText = (url, params = {}) => sendRequestText(getRestUrl(url), params, 'GET')
/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @returns {Promise<any>} 异步加载对象
 * @param cb 回调方法
 */
export const gext = (url, params = {}, cb = empty) => getText(url, params).then(cb)
/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Promise<any>} 返回json
 * @param cb 回调方法
 */
export const post = (url, params = {}, cb = empty) => sendRequestJson(getRestUrl(url), params, 'POST')

/**
 * POST方法提交数据，返回文本
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Object} 返回文本
 */
export const post2Text = (url, params = {}) => sendRequestText(getRestUrl(url), params, 'POST')
/**
 * POST方法提交数据,返回文本
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Promise<any>} 返回文本
 * @param cb 回调方法
 */
export const p2ext = (url, params = {}, cb = empty) => post2Text(url, params).then(cb)
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
 * @return {Promise<any>} 返回json
 * @param cb 回调方法
 */
export const pson = (url, params = {}, cb = empty) => post2Text(url, params).then(cb)

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Object} 返回文本
 */
export const postJson2Text = (url, params = {}) => sendRequestText(getRestUrl(url), params, 'JSON')

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @return {Promise<any>} 返回文本
 * @param cb 回调方法
 */
export const pson2ext = (url, params = {}, cb = empty) => postJson2Text(url, params).then(cb)
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
  const requestConfig = {
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
  // 发生错误时是否不做提示
  const isSilence = params && params[SILENCE_KEY] === 1
  params && (params[SILENCE_KEY] = null) && delete params[SILENCE_KEY]
  try {
    return await fetch(url, requestConfig).then((response) => {
      switch (response.status) {
        case 200:
          return response
        case 400:
          try {
            !isSilence && response.json().then(res => message({type: 'error', message: res.message}))
          } catch (e) {
            console.log(e)
            !isSilence && message({type: 'error', message: '系统异常'})
            throw new Error(e)
          }
          break
        case 406:
          try {
            !isSilence && response.json().then(res => message({type: 'error', message: res.message || '系统异常', items: res.items}))
          } catch (e) {
            console.log(e)
            !isSilence && message({type: 'error', message: '系统异常'})
            throw new Error(e)
          }
          break
        default :
          try {
            response.text().then(res => {
              console.log(res)
              !isSilence && message({type: 'error', message: '系统异常'})
              throw new Error(res)
            })
          } catch (e) {
            console.log(e)
            throw new Error(e)
          }
      }
    })
  } catch (error) {
    console.log(error)
    throw error
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
  type.toUpperCase() === 'GET' && (isEmptyObject(params) || (url = `${url}${toParameters(params, url.indexOf('?') > 0 ? '&' : '?')}`))
  let headers
  let isJson = false
  if (type.toUpperCase() === 'JSON') {
    isJson = true
    headers = header ? Object.assign({}, jsonHeaders, header) : jsonHeaders
    type = 'POST'
  } else {
    headers = header ? Object.assign({}, defaultHeaders, header) : defaultHeaders
  }
  const requestConfig = {
    credentials: 'include',
    method: type,
    headers,
    mode: 'cors',
    cache: 'force-cache'
  }
  type.toUpperCase() === 'POST' && Object.defineProperty(requestConfig, 'body', {
    value: isJson ? JSON.stringify(params) : toParameters(params)
  })
  return fetch(url, requestConfig)
}
