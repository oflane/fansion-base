/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import {gson} from './rest'
import {isPromise, self} from './util'

/**
 * 添加注册数据到注册中心
 * @param data 带有code的单个数据&&数组数据&&map数据
 * @param cb 回调方法
 * @returns {*}
 */
function add2LoadCenter (center, data, cb, key, handle) {
  data && Array.isArray(data) ? data.forEach(v => v[key] && (center[v[key]] = handle(v))) : center.code ? center[data[key]] = handle(data) : Object.entries(data).forEach(([k, v]) => (center[k] = handle(v)))
  return cb && cb(data)
}

/**
 * 添加数组或者对象数据到注册中心
 * @param center 注册中心
 * @param data 数组或者对象
 * @param typeKey 类型键值
 * @param key 数据键值
 * @param handle 数据转换器
 * @param typeValue 类型
 */
function addArrayObject2Center (center, data, typeKey, key, handle, typeValue, defaultType) {
  if (Array.isArray(data)) {
    data.forEach(v => {
      const type = !typeValue && v[typeKey] ? v[typeKey] : (typeValue || defaultType)
      center[type] || (center[type] = {})
      v[key] && (center[type][v[key]] = handle(v))
    })
  } else if (typeof data === 'object') {
    const isLevel = !typeValue && data.__regLevel
    Object.entries(data).forEach(([k, v]) => {
      if (!v) {
        return
      }
      if (isLevel) {
        addArrayObject2Center(center, v, null, key, handle, k)
      } else {
        const type = !typeValue && v[typeKey] ? v[typeKey] : (typeValue || defaultType)
        center[type] || (center[type] = {})
        center[type][k] = handle(v)
      }
    })
  }
}
/**
 * 添加类型嗯注册数据到注册中心
 * @param center 注册中心
 * @param data 带有code的单个数据&&数组数据&&map数据
 * @param cb 回调方法
 * @param typeKey 类型键值
 * @param key 数据键值
 * @param handle 数据转换器
 * @param typeValue 类型
 */
function add2TypeLoadCenter (center, data, cb, typeKey, key, handle, typeValue) {
  if (!data || typeof data === 'string') {
    return cb && cb(data)
  }
  addArrayObject2Center(center, data, typeKey, key, handle, typeValue)
  return cb && cb(data)
}

/**
 * 添加类型注册数据到注册中心
 * @param center 注册中心
 * @param data 带有code的单个数据&&数组数据&&map数据
 * @param target 目标值
 * @param typeKey 类型键值
 * @param key 数据键值
 * @param handle 数据转换器
 * @param typeValue 类型
 */
function add2TypeRegCenter (center, data, target, typeKey, key, handle, typeValue, defaultType) {
  if (!data) {
    return
  }
  if (typeof data === 'string' && target) {
    center[typeValue] || (center[typeValue] = {})
    center[typeValue][data] = handle(target)
  } else {
    addArrayObject2Center(center, data, typeKey, key, handle, typeValue, defaultType)
  }
}

/**
 * 生成加载并注册方法
 * @param center 加载中心对象
 * @param key 键值名称
 * @return {function(*=, *=): Promise<* | never>}
 */
const loader = (center, key = 'name', handle = self) => (data, cb) => data && (data = (typeof data === 'string' ? gson(data) : data)) && isPromise(data) ? data.then(res => add2LoadCenter(center, res, cb, key, handle)) : add2LoadCenter(center, data, cb, key, handle)

/**
 * 生成map注册方法
 * @param center 注册中心对象
 * @param name 注册数据键值名称
 * @param handle 数据转换
 * @returns {function(*=): ({name}|Object)}
 */
const register = (center, key = 'name', handle = self) => (data, target) => data && Array.isArray(data) ? data.forEach(v => v[key] && (center[v[key]] = handle(v))) : typeof data === 'object' ? (data[key] ? (center[data[key]] = handle(data)) : Object.entries(data).forEach(([k, v]) => (center[k] = handle(v)))) : (typeof data === 'string' && target) ? (center[data] = handle(target)) : data

/**
 * 生成集合注册方法
 * @param center 注册中心对象
 * @param handle 数据转换
 * @returns {function(*=): *}
 */
const collection = (center, handle = self) => data => data && Array.isArray(data) ? data.forEach(v => (v = handle(v)) && center.indexOf(v) < 0 && center.push(v)) : (data = handle(data)) && center.indexOf(data) < 0 && center.push(data)

/**
 * 生成按类型加载并注册方法
 * @param center 加载中心对象
 * @param typeKey 类型键值名
 * @param key 数据键值名称
 * @param handle 数据转换
 * @returns {function(any=, any=, any=): any}
 */
const typeLoader = (center, typeKey = 'type', key = 'name', handle = self) => (data, cb, type = 'default') => data && (data = (typeof data === 'string' ? gson(data) : data)) && isPromise(data) ? data.then(res => add2TypeLoadCenter(center, res, cb, typeKey, key, handle, type)) : add2TypeLoadCenter(center, data, cb, typeKey, key, handle, type)
/**
 * 按类型生成map注册方法
 * @param center 注册中心
 * @param key 数据键值
 * @param handle 数据转换
 * @returns {function(*, *=, *=): {name}|Object}
 */
const typeRegister = (center, typeKey = 'type', key = 'name', handle = self, defaultType = 'default') => (data, target, type) => add2TypeRegCenter(center, data, target, typeKey, key, handle, type, defaultType)

/**
 * 生成按类型集合注册方法
 * @param center 注册中心对象
 * @param handle 数据转换
 * @returns {function(*, *=): *}
 */
const typeCollection = (center, handle = self) => (type, data) => collection(center[type])(data)
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
   * @param handle 数据转换
   * @return {function(*=, *=): Promise<* | never>}
   */
  loader,

  /**
   * 生成map注册方法
   * @param center 注册中心对象
   * @param name 注册数据键值名称
   * @param handle 数据转换
   * @returns {function(*=): ({name}|Object)}
   */
  register,

  /**
   * 生成集合注册方法
   * @param center 注册中心对象
   * @param handle 数据转换
   * @returns {function(*=): *}
   */
  collection,
  /**
   * 生成按类型加载并注册方法
   * @param center 加载中心对象
   * @param key 键值名称
   * @param handle 数据转换
   * @returns {function(*, *=, *=): Promise<*|never>}
   */
  typeLoader,
  /**
   * 按类型生成map注册方法
   * @param center 注册中心
   * @param key 数据键值
   * @param handle 数据转换
   * @returns {function(*, *=, *=): {name}|Object}
   */
  typeRegister,
  /**
   * 生成按类型集合注册方法
   * @param center 注册中心对象
   * @param handle 数据转换
   * @returns {function(*, *=): *}
   */
  typeCollection
}
