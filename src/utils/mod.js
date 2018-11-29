/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import { createRequest } from './rest'
import { isPromise, simulatePromise } from './util'

/**
 * 提取模块的方法
 * @param m 异步导入的js模块
 */
export const module = m => m.__esModule ? m.default : m

/**
 * 提取模块的方法
 * @param m 异步导入的js模块
 */
export const mergeModule = m => m.reduce((prev, cur, index) => {
  cur = module(cur)
  if (index === 1) {
    prev = Object.assign({}, module(prev))
  }
  return typeof cur === 'function' ? cur(prev) : Object.assign(prev, cur)
})
/**
 * 默认组件依赖处理
 * @param comps 组件数组
 * @returns {*}
 */
const defaultDependHandle = (comps) => Array.isArray(comps) ? mergeModule(comps) : module(comps)

/**
 * 同时异步加载多个模块js
 * @param comp 目标js
 * @param deps 依赖的js
 * @param handle 依赖处理方法
 */
export const depend = (comp, deps, handle = defaultDependHandle) => Promise.all([comp, ...deps].map(d => typeof d === 'string' ? createRequest(d) : isPromise(d) ? d : simulatePromise(d))).then(handle)
