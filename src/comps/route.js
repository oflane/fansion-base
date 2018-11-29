/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import Vue from 'vue'
import Router from 'vue-router'
import {getJson} from '../utils/rest'
import {isPromise} from '../utils/util'
import pages from './pages'

/**
 * 路由对象
 */
let router = null
/**
 * 获取路由对象
 * @returns {VueRouter}
 */
const getRouter = () => {
  if (router) {
    return router
  }
  Vue.use(Router)
  router = new Router({
    base: '/',
    mode: 'hash'
  })
  return router
}
/**
 * 页面加载规则
 * @type {getPageMeta}
 */
let pageLoader = pages.getPageMeta

/**
 * 设置路由页面加载器
 * @param v 页面加载方法
 * @returns {*}
 */
const setPageLoader = v => (pageLoader = v)
/**
 * 默认的路由解析起
 * @type {Function[]}
 */
let parserRules = [
  (path) => {
    let i = path.indexOf('->')
    let target = path
    let eq = true
    if (i > 0) {
      target = path.substring(i + 2)
      path = path.substring(0, i)
      eq = false
    }
    let isDirect
    let isKeep
    while ((!isDirect && (isDirect = target.startsWith('!'))) || (!isKeep && (isKeep = target.startsWith('^')))) {
      target = target.substring(1)
    }
    if (eq) {
      path = target
    }
    if (isDirect) {
      if (eq) {
        throw new Error('Redirect path can nott equal to target,please redirect path!!')
      }
      return {
        path,
        redirect: target
      }
    }
    console.log('==>' + isKeep)
    return Object.assign({
      path,
      meta: {
        keepAlive: isKeep
      }
    }, pageLoader(target))
  }
]
/**
 * 添加路由解析规则
 * @param ps 解析规则方法或数组
 * @returns {*}
 */
const addParserRules = ps => ps && Array.isArray(ps) ? (parserRules = [...ps, ...parserRules]) : parserRules.splice(0, 0, ps)

/**
 * 根据路由数据进行解析
 * @param route 路由数据
 * @returns {*}
 */
const parseRoute = (route) => {
  for (let i = 0; i < parserRules.length; i++) {
    let rs = parserRules[i](route)
    if (rs) {
      return rs
    }
  }
}

/**
 * 添加路由数据
 * @param routes
 */
const addRoute = (routes) => {
  getRouter().addRoutes(routes.map(v => {
    return parseRoute(v)
  }))
}
/**
 * 添加路由加载器，进行路由加载
 * @param loader 加载起
 */
const addLoader = (loader) => {
  let loaders = []
  if (Array.isArray(loader) && loader.length > 0) {
    loader.forEach(v => {
      if (isPromise(v)) {
        loaders.push(v)
      } else if (typeof v === 'string') {
        loaders.push(getJson(v))
      } else if (typeof v === 'function') {
        loaders.push(new Promise((resolve, reject) => resolve(v())))
      }
    })
  } else if (isPromise(loader)) {
    loaders.push(loader)
  } else if (typeof loader === 'string') {
    loaders.push(getJson(loader))
  } else if (typeof loader === 'function') {
    loaders.push(new Promise((resolve) => resolve(loader())))
  }
  if (loaders.length === 1) {
    loaders[0].then(addRoute)
  } else if (loaders.length > 1) {
    Promise.all(loaders).then(r => addRoute(Array.concat(...r)))
  }
}

/**
 * 路由扩展工具类
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export default {
  /**
   * 路由对象
   */
  getRouter,
  /**
   * 设置路由页面加载器
   * @param v 页面加载方法
   * @returns {*}
   */
  setPageLoader,
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
  addRoute,
  /**
   * 添加路由加载器，进行路由加载
   * @param loader 加载器
   */
  addLoader
}
