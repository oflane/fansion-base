/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import Vue from 'vue'
import Router from 'vue-router'
import rest from '../utils/rest'
import {isPromise, sure, emptyPromise} from '../utils/util'
import pages from './pages'

/**
 * 路由对象
 */
let router = null

let routesData = []

let routeMap = {}

/**
 * 默认的string路径的上级路由，如果最终不变的化，则添加到根路由上
 * @type {string}
 */
let defaultParent = '__'
let hasDefaultParent = false
/**
 * 获取路由对象
 * @returns {VueRouter}
 */
const getRouter = () => {
  if (router) {
    return router
  }
  //当字符串路由的上级路由不存在时，添加到顶级路由，字符串的上级路由在路由创建之后必须时已存在的路有个
  const stringParent = routeMap[defaultParent]
  if (!stringParent.path && Array.isArray(stringParent.children)) {
    stringParent.children.forEach(r => routesData.push(r))
  } else {
    hasDefaultParent = true
  }
  Vue.use(Router)
  router = new Router({
    base: '/',
    mode: 'hash',
    scrollBehavior: () => ({ y: 0 }),
    routes: routesData
  })
  routesData = null
  routeMap = null
  return router
}

/**
 * 判断router是否已经初始化
 * @returns {boolean}
 */
const isInit = () => router !== null
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
const setPageLoader = v => v && (pageLoader = v)

/**
 * 按路径规则解析
 * @param path 路径串
 * @returns {{redirect: string, path: string}|any}
 */
const parseRulePath = (path) => {
  const i = path.indexOf('->')
  let target = path
  let same = true
  i > 0 && sure(target = path.substring(i + 2)) && sure(path = path.substring(0, i)) && (same = false)
  let isDirect, keepAlive
  while ((!isDirect && (isDirect = target.startsWith('!'))) || (!keepAlive && (keepAlive = target.startsWith('^')))) {
    target = target.substring(1)
  }
  if (same && isDirect) {
    throw new Error('Redirect path can not equal to target,please redirect path!!')
  }
  same && (path = target)
  path = path.prefix('/')
  return isDirect ? {
    path,
    name: path,
    redirect: target
  } : Object.assign({
    path,
    name: path,
    meta: {keepAlive}
  }, pageLoader(target))
}
/**
 * 默认的路由解析起
 * @type {Function[]}
 */
let parserRules = [
  (path) => {
    if (typeof path === 'string') {
      const res = parseRulePath(path)
      res.parent = defaultParent
      return res
    } else if (typeof path === 'object') {
      const res = parseRulePath(path.path)
      if (!path.redirect && res.redirect) {
        path.redirect = res.redirect
      }
      if (!path.redirect) {
        if (!path.component) {
          path.path = res.path
          path.component = res.component
          if (res.props) {
            path.props ? Object.assign(path.props, res.props) : path.props = res.props
          }
        }
        if (path.meta && typeof path.meta.keepAlive !== 'boolean') {
          path.meta.keepAlive = res.meta.keepAlive
        }
      }
      return path;
    }
  }
]
/**
 * 添加路由解析规则
 * @param ps 解析规则方法或数组
 * @returns {*}
 */
const addParserRules = ps => ps && (Array.isArray(ps) ? (parserRules = [...ps, ...parserRules]) : parserRules.push(ps))
/**
 * 设置路由解析规则
 * @param ps 解析规则方法或数组
 * @returns {*}
 */
const setParserRules = ps => ps && (Array.isArray(ps) ? (parserRules = ps) : parserRules = [ps])
/**
 * 根据路由数据进行解析
 * @param route 路由数据
 * @returns {*}
 */
const parseRoute = (route) => parserRules.firstNotNull(r => r(route))

/**
 * 添加路由数据
 * @param route 路由数据
 * @param parent 上级路由
 */
const addRoute = (route, parent) => {
  //valid param is correnct
  if (route == null) {
    return
  }
  if (Array.isArray(route)) {
    route.forEach(r => addRoute(r, parent))
  } else {
    const r = parseRoute(route)
    if(!r) {
      return
    }
    !parent && (parent = r.parent)
    if (isInit()) {
      if(parent === defaultParent && !hasDefaultParent){
        getRouter().addRoute(r)
      } else {
        getRouter().addRoute(parent, r)
      }
    } else {
      if (parent) {
        let parentRoute = routeMap[parent]
        if (!parentRoute) {
          parentRoute = {}
          routeMap[parent] = parentRoute
        }
        Array.isArray(parentRoute.children) ? parentRoute.children.push(r) : parentRoute.children = [r]
      } else {
        routesData.push(r)
      }
      const temp = routeMap[r.path]
      if (temp && Array.isArray(temp.children)) {
        r.children = Array.isArray(r.children) ? temp.concat(r.children) : temp.children
      }
      routeMap[r.path] = r
    }
  }
}

/**
 * 转换routeLoader为promise对象
 * @param v 原对象
 * @returns {Promise<any>}
 */
const convertLoader = v => typeof v === 'function' ? new Promise((resolve) => resolve(v())) : typeof v === 'string' ? rest.gson(v) : isPromise(v) ? v : emptyPromise
/**
 * 添加路由加载器，进行路由加载
 * @param loader 加载起
 */
const addLoader = loader => loader && (Array.isArray(loader) && loader.length > 0 ? Promise.all(loader.map(v => convertLoader(v)).filter(v => v)).then(r => addRoute(Array.concat(...r))) : convertLoader(loader).then(addRoute))
/**
 * 设置默认的string类型路由的上级路由
 * @param stringParent 上级路由路径
 */
const setStringParent = (stringParent) => {
  if (!stringParent){
    return
  }
  //对切换string类型上级路由的处理
  const oldParent = routeMap[defaultParent]
  defaultParent = stringParent
  if (!oldParent || !Array.isArray(oldParent.children)){
    return
  }
  const parent = routeMap[stringParent]
  if (parent) {
    Array.isArray(parent.children) ? oldParent.children.forEach(r => parent.children.push(r)) : parent.children = oldParent.children
  } else {
    routeMap[stringParent] = {children: oldParent.children}
  }
  oldParent.children = []
}
/**
 * 初始化路由
 * @param routes 路由规则
 * @param routeLoader 路由加载器
 * @param rules 路由解析规则
 * @param pageLoader 页面记载器
 * @param stringParent string类型路由的默认上级路由
 */
const init = ({routes, routeLoader, rules, pageLoader, stringParent}) => sure(addRoute(routes)) && sure(setParserRules(rules)) && sure(addLoader(routeLoader)) && sure(setPageLoader(pageLoader)) && setStringParent(stringParent)
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
   * 设置默认的string类型路由的默认上级路由，如果该路由不存在则添加到根路由
   */
  setStringParent,
  /**
   * 添加路由解析规则
   * @param ps 解析规则方法或数组
   * @returns {*}
   */
  addParserRules,

  /**
   * 添加路由解析规则
   * @param ps 解析规则方法或数组
   * @returns {*}
   */
  setParserRules,
  /**
   * 添加路由数据
   * @param routes
   */
  addRoute,
  /**
   * 添加路由加载器，进行路由加载
   * @param loader 加载器
   */
  addLoader,
  /**
   * 初始化路由
   */
  init
}
