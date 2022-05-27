/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import Vue from 'vue'
import Vuex from 'vuex'

/**
 * 路由对象
 */
let store = null

let storeOptions = {}

/**
 * 获取store对象
 * @returns {VueRouter}
 */
const getStore = () => {
  if (store) {
    return store
  }
  if (Vuex) {
    Vue.use(Vuex)
    store = new Vuex.Store(storeOptions)
    storeOptions = null
  }
  return store
}

/**
 * 判断store是否已经初始化
 * @returns {boolean}
 */
const isInit = () => store !== null

/**
 * 添加模块
 * @param paths 路径
 * @param module 模块对象
 */
const addModule = (paths, module) => {
  //valid param is correnct
  if (module == null) {
    if (!paths || typeof paths !== 'object' ) {
      return
    }
    addModule([], paths)
    return
  }
  if (Array.isArray(paths) && typeof module === 'object') {
    const real = (module.state || module.mutations || module.actions || modules.getters) ? {
      state: module.state,
      mutations: module.mutations,
      actions: module.actions,
      getters: module.getters
    } : null
    if (isInit()) {
      real && !store.registerModule.hasModule(paths) && store.registerModule(paths, real)
    } else {
      let data = storeOptions
      paths.forEach(p => {
        if (!data.modules) {
          data.modules = {}
        }
        if (!data.modules[p]) {
          data.modules[p] = {}
        }
        data = data.modules[p]
      })
      real && Object.assign(data, real)
      if (module.namespaced) {
        data.namespaced = true
      }
    }
    // add sub module
    if(module.modules && typeof module.modules === 'object') {
      Object.entries(([p, m]) => {
        addModule([...paths, p], m)
      })
    }
    if (paths.length === 0 && Array.isArray(module.plugins) && !isInit()) {
      storeOptions.plugins ? storeOptions.plugins = [...storeOptions.plugins, ...module.plugins] : storeOptions.plugins = module.plugins
    }
  }
}


/**
 * 初始化路由
 * @param routes 路由规则
 * @param routeLoader 路由加载器
 * @param rules 路由解析规则
 * @param pageLoader 页面记载器
 */
const init = (option) => addModule(option)
/**
 * vuex store扩展工具类
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export default {
  /**
   * store对象
   */
  getStore,

  /**
   * 添加模块
   */
  addModule,

  /**
   * store
   */
  init
}
