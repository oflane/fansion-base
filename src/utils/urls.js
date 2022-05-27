/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import rest from '../utils/rest'
import {isPromise, sure, emptyPromise} from '../utils/util'

/**
 * url注册对象
 */
const allUrls = {}
/**
 * 获取url
 * @returns url串
 */
const come = (key) => {
  return allUrls[key] || key
}

/**
 * 默认的url解析起
 * @type {Function[]}
 */
let parserRules = [
  (path) => {
    if (typeof path !== 'string') {
      return null
    }
    const i = path.indexOf('->')
    return i > 0 ? {key: path.substring(i + 2), url: path.substring(0, i)} : null
  }
]
/**
 * 添加路由解析规则
 * @param ps 解析规则方法或数组
 * @returns {*}
 */
const addParserRules = ps => ps && (Array.isArray(ps) ? (parserRules = [...ps, ...parserRules]) : parserRules.splice(0, 0, ps))

/**
 * 根据路由数据进行解析
 * @param route 路由数据
 * @returns {*}
 */
const parseUrl = (url) => parserRules.firstNotNull(r => r(url)) || url

/**
 * 添加url数据
 * @param routes
 */
const addUrl = (urls) => Array.isArray(urls) && urls.map(v => parseUrl(v)).forEach(u => ('key' in u) ? (allUrls[u.key] = u.url) : Object.assign(allUrls, u))

/**
 * 转换urlLoader为promise对象
 * @param v 原对象
 * @returns {Promise<any>}
 */
const convertLoader = v => typeof v === 'function' ? new Promise((resolve) => resolve(v())) : typeof v === 'string' ? rest.gson(v) : isPromise(v) ? v : emptyPromise
/**
 * 添加路由加载器，进行路由加载
 * @param loader 加载起
 */
const addLoader = loader => loader && (Array.isArray(loader) && loader.length > 0 ? Promise.all(loader.map(v => convertLoader(v)).filter(v => v)).then(r => addUrl(Array.concat(...r))) : convertLoader(loader).then(addUrl))

/**
 * 初始化路由
 * @param urls 预置url
 * @param urlsLoader url加载器
 * @param rules url解析规则
 */
const init = ({urls, urlsLoader, rules}) => sure(addUrl(urls)) && sure(addParserRules(rules)) && sure(addLoader(urlsLoader))
/**
 * url注册缓存工具
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export default {
  /**
   * 路由对象
   */
  come,
  /**
   * 添加路由解析规则
   * @param ps 解析规则方法或数组
   * @returns {*}
   */
  addParserRules,
  /**
   * 添加路由数据
   * @param routes
   */
  addUrl,
  /**
   * 添加url加载器，进行url加载
   * @param loader 加载器
   */
  addLoader,
  /**
   * 初始化路由
   */
  init
}
