/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import builder from '../utils/builder'
import {sure} from '../utils/util'

/**
 * 页面注册中心
 * @type {{}}
 */
let pageComps = {}

/**
 * 页面元数据注册中心
 * @type {{}}
 */
let pageMetas = {}
/**
 * 页面元数据加载规则集合
 * @type {Array}
 */
let rules = []

/**
 * 根据模板名称获取模板对象
 * @param name
 * @returns {*}
 */
const getPageComp = (name) => pageComps[name]

/**
 * 添加页面数据
 * @param data{Object|Array|string} 页面注册数据可以时数组，单个页面对象，多个对象map
 * @param target {Object|Array|string} data为string时，target为目标数据
 */
const addPageComp = builder.register(pageComps)

/**
 * 添加页面页面数据
 * @param data{Object|Array|string} 页面元数据注册数据可以时数组，单个模板对象，多个对象map
 * @param target {Object|Array|string} data为string时，target为目标数据
 */
const addPageMeta = builder.register(pageMetas)

/**
 * 根据路径加载页面元数据
 * @param name 页面元数据名称
 * @returns {Object}
 */
const getPageMeta = (name) => {
  let meta = pageMetas[name]
  if (meta) {
    return meta
  }
  let component = getPageComp(name)
  return component ? sure(meta = {component}) && sure(addPageMeta(name, meta)) && meta : rules.firstNotNull(r => r(name, addPageMeta, pageMetas))
}
/**
 * 添加页面元数据规则信息
 * @param data 规则数据
 */
const addRule = builder.collection(rules)
/**
 * 页面加载规则
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2010/23/18
 */
export default {
  /**
   * 页面中心
   */
  data: pageComps,
  /**
   * 页面元数据
   */
  pageMetas,

  /**
   * 根据模板名称获取模板对象
   * @param name
   * @returns {*}
   */
  getPageComp,

  /**
   * 添加页面数据
   * @param data{Object|Array|string} 页面注册数据可以时数组，单个页面对象，多个对象map
   * @param target {Object|Array|string} data为string时，target为目标数据
   */
  addPageComp,

  /**
   * 添加页面页面数据
   * @param data{Object|Array|string} 页面元数据注册数据可以时数组，单个模板对象，多个对象map
   * @param target {Object|Array|string} data为string时，target为目标数据
   */
  addPageMeta,

  /**
   * 根据路径加载页面元数据
   * @param name 页面元数据名称
   * @returns {Object}
   */
  getPageMeta,

  /**
   * 添加页面元数据规则信息
   * @param data 规则数据
   */
  addRule,
  /**
   * 初始化数据
   * @param options
   * @returns {*|{name}|Object}
   */
  init: (options) => {
    if (!options) {
      return
    }
    addPageComp(options.pageComps)
    addPageMeta(options.pageMetas)
    addRule(options.rules)
  }
}
