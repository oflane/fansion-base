/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import {gson} from './rest'
import {isPromise, self} from './util'

/**
 * 添加参照注册数据到
 * @param data 带有code的单个数据&&数组数据&&map数据
 * @param cb 回调方法
 * @returns {*}
 */
function add2Center (center, data, cb, key, handle) {
  data && Array.isArray(data) ? data.forEach(v => v.code && (center[v[key]] = handle(v))) : center.code ? center[data[key]] = handle(data) : Object.entries(data).forEach(([k, v]) => (center[k] = handle(v)))
  return cb && cb(data)
}

/**
 * 构建对象
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2010/20/18
 */
export default {
  /**
   * 生成加载并注册方法
   * @param center 加载中心对象
   * @param key 键值名称
   * @return {function(*=, *=): Promise<* | never>}
   */
  loader: (center, key = 'name', handle = self) => (data, cb) => data && (data = (typeof data === 'string' ? gson(data) : data)) && isPromise(data) ? data.then(res => add2Center(center, res, cb, key, handle)) : add2Center(center, data, cb, key, handle),

  /**
   * 生成map注册方法
   * @param center 注册中心对象
   * @param name 注册数据键值名称
   * @returns {function(*=): ({name}|Object)}
   */
  register: (center, key = 'name', handle = self) => (data, target) => data && Array.isArray(data) ? data.forEach(v => v[key] && (center[v[key]] = handle(v))) : typeof data === 'object' ? (data[key] ? (center[data[key]] = data) : Object.entries(data).forEach(([k, v]) => (center[k] = handle(v)))) : (typeof data === 'string' && target) ? (center[data] = handle(target)) : data,

  /**
   * 生成集合注册方法
   * @param center 注册中心对象
   * @returns {function(*=): *}
   */
  collection: (center, handle = self) => data => data && Array.isArray(data) ? data.forEach(v => (v = handle(v)) && center.indexOf(v) < 0 && center.push(v)) : (data = handle(data)) && center.indexOf(data) < 0 && center.push(data)

}
