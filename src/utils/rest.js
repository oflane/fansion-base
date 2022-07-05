/* eslint-disable no-extend-native */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import {message, error} from './util'
import urls from './urls'
import axios from 'axios'
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
 * rest url参数提取正则
 * @type {RegExp}
 */
const REG_URLPATTERN = /\/:(\w+)/g

/**
 * 提取url中的参数名
 * @param url 需要提取的url
 * @returns {Array}
 */
const parseRestPath = url => {
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
 * 将参数转成url串
 * @param data [Object] json格式的对象
 * @returns {string} 拼接好的formData格式字符串
 * @param prefix 前缀信息
 */
const toParameters = (data, prefix = '') => prefix + Object.entries(data).map(([k, v]) => !v ? undefined : Array.isArray(v) ? v.map(vi => vi ? k + '=' + vi : undefined).join('&') : k + '=' + encodeURIComponent(v)).join('&')

/**
 * 将参数添加到url地址中
 * @param url 原始url
 * @param params 参数
 * @returns {string|*} 构建后url
 */
const buildParameterUrl = (url, params) =>  (params ? Object.keys(params).length : 0) > 0 ? `${url}${toParameters(params, url.indexOf('?') > 0 ? '&' : '?')}` : url


/**
 * 提取url中的参数名,进行填充
 * @param url {String} 需要提取的url
 * @param data {Object} 填充数据
 * @returns 填充后url串
 */
const furl = (url, data) => {
  url = urls.come(url)
  parseRestPath(url).forEach(p => {
    url = url.replace(':' + p, encodeURIComponent(data[p] || ''))
  })
  return url
}

/**
 * 增加rest请求的上下问路径
 * @param url {string} 请求地址
 * @return {string} 转换后路径
 */
const getRestUrl = (url) => urls.come(url)

/**
 * 默认的结果处理方法
 * @param silence 是否静默处理
 * @returns {(function(*): *)|*}
 */
let defaultError = (error) => {
  console.log(error)
  if(error.response) {
    const response = error.response
    const data =  response.data || {}
    switch (response.status) {
      case 400:
        try {
          message({type: 'error', message: data.message || '系统异常'})
        } catch (e) {
          console.log(e)
          message({type: 'error', message: '系统异常'})
          throw new Error(e)
        }
        break
      case 406:
        message({type: 'error', message: data.message || '系统异常', items: data.items})
        break
      default :
        message({type: 'error', message: '系统异常'})
    }
  } else if (error.status !== null && error.status !== undefined) {
    message({type: 'error', message: error.message || '系统异常'})
  }
  return Promise.reject(error)
}
/**
 * 默认的header信息
 * @type {{Accept: string, 'Content-Type': string}}
 */
const formHeaders = {
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
const instance = axios.create({
  transformRequest: [function (data, headers) {
    // 对 data 进行任意转换处理
    if(!headers || headers.Accept === 'application/json') {
      return data && (typeof data === 'string' ? data : JSON.stringify(data));
    }
    return data && (typeof data === 'string' ? data : toParameters(data));
  }],
})
instance.defaults.timeout = 5000;
instance.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';
instance.interceptors.response.use(response => {
  return response.data
})
/**
 * 根据开关处理请求参数类型和返回参数类型
 * @param config 配置对象
 * @param requestJson 请求是否为json数据
 * @param respsonseJson 相响应是否为json数据
 * @returns {any}
 */
const header = (config, requestJson = false, respsonseJson = true) => Object.assign(config, {headers: requestJson ? jsonHeaders : formHeaders, responseType: respsonseJson ? 'json' : 'text'})
/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @param config {object} 请求配置
 * @returns {Promise.<*>} 异步加载对象
 */
const getJson = (url, params = {}, config = {}) => {
  const promise = instance.get(buildParameterUrl(getRestUrl(url), params), config)
  return config.silence ? promise : promise.catch(defaultError)
}
/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @param cb 回调方法
 * @param config {object} 请求配置
 * @returns {Promise<any>} 异步加载对象
 */
const gson = (url, params = {}, cb, config = {}) => cb ? getJson(url, params, config).then(cb) : getJson(url, params)
/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @param config {object} 请求配置
 * @returns {Promise.<*>} 异步加载对象
 */
const getText = (url, params = {}, config = {}) => {
  const promise = instance.get(buildParameterUrl(getRestUrl(url), params), Object.assign(config, {responseType: 'text'}))
  return config.silence ? promise : promise.catch(defaultError)
}
/**
 * rest 调用get请求
 * @param url {string} url串不带contextPath
 * @param params {object} 参数
 * @param cb 回调方法
 * @param config {object} 请求配置
 * @returns {Promise<any>} 异步加载对象
 */
const gext = (url, params = {}, cb, config = {}) => cb ? getText(url, params, config).then(cb) : getText(url, params)
/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @param config {object} 请求配置
 * @return {Promise<any>} 返回json
 */
const post = (url, params = {}, config = {}) => {
  const promise = instance.post(getRestUrl(url), params, header(config))
  return config.silence ? promise : promise.catch(defaultError)
}

/**
 * POST方法提交数据，返回文本
 * @param url 请求的url
 * @param params 提交的参数
 * @param config {object} 请求配置
 * @return {Object} 返回文本
 */
const post2Text = (url, params = {}, config = {}) => {
  const promise = instance.post(getRestUrl(url), params, header(config, false, false))
  return config.silence ? promise : promise.catch(defaultError)
}
/**
 * POST方法提交数据,返回文本
 * @param url 请求的url
 * @param params 提交的参数
 * @param cb 回调方法
 * @param config {object} 请求配置
 * @return {Promise<any>} 返回文本
 */
const p2ext = (url, params = {}, cb, config = {}) => cb ? post2Text(url, params, config).then(cb) : post2Text(url, params, config)
/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @param config {object} 请求配置
 * @return {Object} 返回json
 */
const postJson = (url, params = {}, config = {}) => {
  const promise = instance.post(getRestUrl(url), params, header(config, true, true))
  return config.silence ? promise : promise.catch(defaultError)
}

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @param cb 回调方法
 * @param config {object} 请求配置
 * @return {Promise<any>} 返回json
 */
const pson = (url, params = {}, cb, config = {}) => cb ? postJson(url, params, config).then(cb) : postJson(url, params, config)

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @param config {object} 请求配置
 * @return {Object} 返回文本
 */
const postJson2Text = (url, params = {}, config = {}) => {
  const promise = instance.post(getRestUrl(url), params, header(config, true, false))
  return config.silence ? promise : promise.catch(defaultError)
}

/**
 * POST方法提交数据
 * @param url 请求的url
 * @param params 提交的参数
 * @param cb 回调方法
 * @param config {object} 请求配置
 * @return {Promise<any>} 返回文本
 */
const pson2ext = (url, params = {}, cb, config = {}) => cb ? postJson2Text(url, params, config).then(cb) : postJson2Text(url, params, config)

/**
 * 生成promise请求对象
 * @param url [String] 请求地址
 * @param params [Object] 携带的数据
 * @param type [String] 方法 默认'get'支持'post'、'delete'
 * @param header 请求头
 * @returns {Promise.<*>}
 */
const createRequest = (url, params = {}, type = 'GET', header) => {
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
/**
 * 添加请求拦截器
 * @param resolver 拦截处理
 * @param reject 错误处理
 */
const addRequestInterceptor = (resolver, reject) => {
  instance.interceptors.request.use(resolver, reject)
}
/**
 * 添加响应拦截器
 * @param resolver 拦截处理
 * @param reject 错误处理
 */
const addResponseInterceptor = (resolver, reject) => {
  instance.interceptors.response.use(resolver, reject)
}

/**
 * 添加拦截齐
 * @param addFunc 拦截器方法
 * @param data 拦截器数据
 */
const addInterceptor = (addFunc, data) => {
  if (Array.isArray(data) && data.length > 0) {
    addFunc(data[0], data.length > 1 ? data[1] : null)
  } else if (typeof data === 'function') {
    addFunc(data)
  } else if (typeof data === 'object'){
    const {resolver, reject} = data
    addFunc(resolver, reject)
  }
}
/**
 * 初始化设置
 * @param headers 头设置
 * @param timeout 超时设置
 * @param baseURL 基础url
 * @param defaultError 默认的错误处理
 */
const init = ({headers, timeout, baseURL, errorHandler, request, response}) => {
  headers && Object.entries(headers).forEach(([k, v]) => {
    Object.assign(instance.defaults.headers[k], v)
  })
  timeout && (instance.defaults.timeout = timeout)
  baseURL && (instance.defaults.baseURL = baseURL)
  errorHandler && (defaultError = errorHandler)
  if (request) {
    addInterceptor(addRequestInterceptor, request)
  }
  if (response) {
    addInterceptor(addResponseInterceptor, response)
  }
}
/**
 * 基于rest的开放函数
 */
export default {
  /**
   * 提取url中的参数名
   * @param url 需要提取的url
   * @returns {Array}
   */
  parseRestPath,
  /**
   * 将对象专场url参数传
   * @param data [Object] json格式的对象
   * @returns {string} 拼接好的formData格式字符串
   * @param prefix 前缀信息
   */
  toParameters,
  /**
   * 将参数添加到url地址中
   * @param url 原始url
   * @param params 参数
   * @returns {string|*} 构建后url
   */
  buildParameterUrl,
  /**
   * 提取url中的参数名,进行填充
   * @param url {String} 需要提取的url
   * @param data {Object} 填充数据
   * @returns 填充后url串
   */
  furl,
  /**
   * 增加rest请求的上下问路径
   * @param url {string} 请求地址
   * @return {string} 转换后路径
   */
  getRestUrl,
  /**
   * rest 调用get请求
   * @param url {string} url串不带contextPath
   * @param params {object} 参数
   * @param config {object} 请求配置
   * @returns {Promise.<*>} 异步加载对象
   */
  getJson,
  /**
   * rest 调用get请求
   * @param url {string} url串不带contextPath
   * @param params {object} 参数
   * @param cb 回调方法
   * @param config {object} 请求配置
   * @returns {Promise<any>} 异步加载对象
   */
  gson,
  /**
   * rest 调用get请求
   * @param url {string} url串不带contextPath
   * @param params {object} 参数
   * @param config {object} 请求配置
   * @returns {Promise.<*>} 异步加载对象
   */
  getText,
  /**
   * rest 调用get请求
   * @param url {string} url串不带contextPath
   * @param params {object} 参数
   * @param cb 回调方法
   * @param config {object} 请求配置
   * @returns {Promise.<*>} 异步加载对象
   */
  gext,
  /**
   * POST方法提交数据
   * @param url 请求的url
   * @param params 提交的参数
   * @param cb 回调方法
   * @param config {object} 请求配置
   * @return {Promise<any>} 返回json
   */
  post,

  /**
   * POST方法提交数据，返回文本
   * @param url 请求的url
   * @param params 提交的参数
   * @param config {object} 请求配置
   * @return {Object} 返回文本
   */
   post2Text,
  /**
   * POST方法提交数据,返回文本
   * @param url 请求的url
   * @param params 提交的参数
   * @param cb 回调方法
   * @param config {object} 请求配置
   * @return {Promise<any>} 返回文本
   */
  p2ext,
  /**
   * POST方法提交数据
   * @param url 请求的url
   * @param params 提交的参数
   * @param config {object} 请求配置
   * @return {Object} 返回json
   */
  postJson,

  /**
   * POST方法提交数据
   * @param url 请求的url
   * @param params 提交的参数
   * @param cb 回调方法
   * @param config {object} 请求配置
   * @return {Promise<any>} 返回json
   */
  pson,

  /**
   * POST方法提交数据
   * @param url 请求的url
   * @param params 提交的参数
   * @param config {object} 请求配置
   * @return {Promise<any>} 返回json
   */
  postJson2Text,

  /**
   * POST方法提交数据
   * @param url 请求的url
   * @param params 提交的参数
   * @param cb 回调方法
   * @param config {object} 请求配置
   * @return {Promise<any>} 返回文本
   */
  pson2ext,

  /**
   * 生成promise请求对象
   * @param url [String] 请求地址
   * @param params [Object] 携带的数据
   * @param type [String] 方法 默认'get'支持'post'、'delete'
   * @returns {Promise.<*>}
   */
  createRequest,
    /**
   * axios实例
   */
  axios: instance,
  /**
   * 添加请求拦截器
   * @param resolver 拦截处理
   * @param reject 错误处理
   */
  addRequestInterceptor,
  /**
   * 添加响应拦截器
   * @param resolver 拦截处理
   * @param reject 错误处理
   */
  addResponseInterceptor,
  /**
   * 初始化方法
   */
  init
}
