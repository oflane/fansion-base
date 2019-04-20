/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import Vue from 'vue'
import Router from 'vue-router'
import {getJson} from '../utils/rest'
import {isPromise, sure, emptyPromise} from '../utils/util'
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
const setPageLoader = v => v && (pageLoader = v)
/**
 * 默认的路由解析起
 * @type {Function[]}
 */
let parserRules = [
  (path) => {
    let i = path.indexOf('->')
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
    return isDirect ? {
      path,
      redirect: target
    } : Object.assign({path, meta: {keepAlive}}, pageLoader(target))
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
const parseRoute = (route) => parserRules.firstNotNull(r => r(route))

/**
 * 添加路由数据
 * @param routes
 */
const addRoute = (routes) => Array.isArray(routes) && getRouter().addRoutes(routes.map(v => parseRoute(v)))

/**
 * 转换routeLoader为promise对象
 * @param v 原对象
 * @returns {Promise<any>}
 */
const convertLoader = v => typeof v === 'function' ? new Promise((resolve) => resolve(v())) : typeof v === 'string' ? getJson(v) : isPromise(v) ? v : emptyPromise
/**
 * 添加路由加载器，进行路由加载
 * @param loader 加载起
 */
const addLoader = loader => loader && (Array.isArray(loader) && loader.length > 0 ? Promise.all(loader.map(v => convertLoader(v)).filter(v => v)).then(r => addRoute(Array.concat(...r))) : convertLoader(loader).then(addRoute))

/**
 * 初始化路由
 * @param routes 路由规则
 * @param routeLoader 路由加载器
 * @param rules 路由解析规则
 * @param pageLoader 页面记载器
 */
const init = ({routes, routeLoader, rules, pageLoader}) => sure(addRoute(routes)) && sure(addLoader(routeLoader)) && sure(addParserRules(rules)) && setPageLoader(pageLoader)
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
  addLoader,
  /**
   * 初始化路由
   */
  init
}
