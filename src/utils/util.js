/* eslint-disable space-in-parens */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
/**
 * 空方法
 */
const empty = () => undefined
/**
 * 返回自己的方法
 * @param v 数据对象
 * @returns {*}
 */
const self = v => v
/**
 * 抛错方法方便代码抛出错误
 * @param error
 */
const error = error => {
  throw error
}
/**
 * Ensure a function is called only once.
 */
const once = (fn) => {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}
/**
 * 提取带参数url的url如带abc/abc/:id
 * @param path 原始路径
 * @param r 无用参数
 * @returns {string} 提取后路径
 */
const parsePath = (path, r) => (r = /(\/[^:]*)\/:(\w+)/.exec(path)) && r.length > 1 ? r[1] : path

/**
 * 将一个字符串重复多次
 * @param str 需要重复的字符串
 * @param n 重复次数
 * @returns {string} 结果串
 */
const repeat = (str, n) => {
  let res = ''
  while (n) {
    if (n % 2 === 1) { res += str }
    if (n > 1) { str += str }
    n >>= 1
  }
  return res
}

/**
 * 过滤对象属性
 * @param obj 需要过滤的对象
 * @param predicate 过滤方法
 */
const filter = (obj, predicate) => Object.keys(obj).filter(key => predicate(obj, key)).reduce((res, k) => ((res[k] = obj[k])) !== res && res, {})

/**
 * 过滤指定的属性创建新的对象
 * @param obj 需要过滤的对象
 * @param props 过滤掉的属性
 */
const filterProps = (obj, props) => filter(obj, (obj, key) => props.indexOf(key) < 0)

/**
 * 深度拷贝
 * @param obj 原始对象
 * @returns {{}}
 */
const deepClone = (obj) => Array.isArray(obj) ? obj.reduce((result, v) => (result.push(deepClone(v)) || true) && result, []) : obj && typeof obj === 'object' ? Object.entries(obj).reduce((result, [k, v]) => ((result[k] = deepClone(v)) || true) && result, {}) : obj

/**
 * 深度对比两个对象
 * @param left 对象１
 * @param right 对象2
 * @returns {boolean} 是否相等
 */
const compareObj = (left, right) => (Object.is(left, right) || left === right) ? true : isEmpty(left) ? isEmpty(right) : (isNotEmpty(right) && (Array.isArray(left) && Array.isArray(right) ? left.length === right.length && left.every((v, i) => compareObj(v, right[i])) : typeof left === 'object' && typeof right === 'object' ? Object.entries(left).every(([k, v]) => compareObj(v, right[k])) : false))
/*
仿vue proxy方法，用来处理fac data
*/

/**
 * 属性代理对象
 * @type {{set: (function(): undefined), enumerable: boolean, get: (function(): undefined), configurable: boolean}}
 */
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: empty,
  set: empty
}

/**
 * 为对象的属性对象的属性的getset方法创建代理用于生成监听
 * @param target 指定的对象
 * @param sourceKey 属性对象
 * @param key 属性对象的属性
 */
const proxy = function (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

/**
 * 判断对象是否不为空和空串，包括带有空格的字符串
 * @param v 需要判断的串
 * @returns {boolean} 布尔值
 */
const isNotBlank = v => v !== undefined && v !== null && v.trim() !== ''

/**
 * 判断对象是否不为空和空串
 * @param v 需要判断的串
 * @returns {boolean} 布尔值
 */
const isNotEmpty = v => v !== undefined && v !== null && v !== ''

/**
 * 判断对象是否不为空
 * @param v 需要判断的对象
 * @returns {boolean} 布尔值
 */
const isNotNull = v => v !== undefined && v !== null

/**
 * 判断对象是否为空或空串，包括带有空格的字符串
 * @param v 需要判断的对象
 * @returns {boolean} 布尔值
 */
const isBlank = v => v === undefined || v === null || v.trim() === ''

/**
 * 判断对象是否为空或空串
 * @param v 需要判断的对象
 * @returns {boolean} 布尔值
 */
const isEmpty = v => v === undefined || v === null || v === ''

/**
 * 判断对象是否为空
 * @param v 需要判断的对象
 * @returns {boolean} 布尔值
 */
const isNull = v => v === undefined || v === null

/**
 * 判断对象是否为空
 * @param v 指定的值
 * @returns {*|boolean}
 */
const isEmptyObject = v => !v || Object.keys(v).length === 0
/**
 * 判断对象是否不为空
 * @param v 指定的值
 * @returns {*|boolean}
 */
const isNotEmptyObject = v => typeof v === 'object' && Object.keys(v).length > 0
/**
 * 判断对象是否为vue组件
 * @param v 指定的值
 * @returns {*|boolean}
 */
const isVueComponent = v => v && (typeof v.template === 'string' || typeof v.render === 'function' || typeof v.created === 'function')

/**
 * 判断对象是否为方法
 * @param val 参数
 * @returns {*|boolean}
 */
const isFunction = val => val && typeof val === 'function'
/**
 * 判断对象是否为Promise对象
 * @param v 指定的值
 * @returns {*|boolean}
 */
const isPromise = v => v && typeof v.then === 'function'

/**
 * 制造一个伪Promise对象
 * @param o 普通对象
 * @returns {Promise<any>}
 */
const simulatePromise = o => new Promise(resolve => o && resolve(o))

/**
 * 空Promise对象
 * @type {Promise<any>}
 */
const emptyPromise = new Promise(empty)
/**
 * 确保代码参数结果为真
 * @returns {boolean}
 * @param _
 */
const sure = _ => true

/**
 * 返回上级实现
 * @param vm vue组件
 * @param home 当没有上一层时是否回指定页面
 * @param target 目标页面路径，默认为/
 * @return {any}
 */
const backPrev = (vm, home, target = '/') => (window.history.length <= 1 || window.history.state == null) ? (home ? (vm && vm.$router ? vm.$router.push(target) : (window.location = target)) : window.close()) : (vm && vm.$router ? vm.$router.back() : window.history.back())

/**
 * 调用某对象的指定方法并传入回调反方法，如果无此方法，直接回调
 * @param obj
 * @param method
 * @param cb
 * @param defaultValue 回调默认值
 */
const callback = (obj, method, cb, defaultValue) => {
  obj && obj[method] && isFunction(obj[method]) ? obj[method](cb, defaultValue) : cb && cb(defaultValue)
}

/**
 * 显示信息
 * @param type 信息类型
 * @param message
 * @param items 详细条目
 * @param html 是否为html信息
 * @param autoClose 是否自动关闭
 */
let msgComp = ({type = 'info', message, items, html = false, autoClose = true}) => {
  alert(message + (items && items.length > 0 ? '\n' + items.join('\n') : ''))
}

/**
 * 对外发布的方法
 * @param msg 消息体
 */
const message = (msg) => msgComp(msg)

/**
 * 设置消息组件
 * @param msg
 * @returns {*}
 */
const setMessageComp = (msg) => (msgComp = msg)

/**
 * 判断字符串是否为保留字
 * @param str 字符串
 * @returns {boolean} 布尔
 */
const isReserved = (str) => {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * 自实现绑定
 * @param fn 方法对象
 * @param ctx 所属对象
 * @returns {function(*=): *} 包装后方法
 */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length
  return boundFn
}

/**
 * 本地绑定
 * @param fn 方法对象
 * @param ctx 所属对象
 * @returns {any} 包装后方法
 */
function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

/**
 * 方法绑定
 * @type {{(Function, Object): any, (Function, Object): function(*=): *}}
 */
const bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind

/**
 * 获取第一个非空值
 * @returns {*}
 */
const noneValue = function() {
  for (let i = 0; i < arguments.length; i++) {
    let v = arguments[i]
    if (v !== undefined && v !== null) {
      return v
    }
  }
  return null
}
/**
 * 查找最近的vue组件
 * @param element 当前组件
 * @param componentName 查找的组件名
 * @returns {null|*}
 */
const findNearestComponent = (element, componentName) => {
  let target = element
  while (target && target.tagName !== 'BODY') {
    if (target.__vue__ && target.__vue__.$options.name === componentName) {
      return target.__vue__
    }
    target = target.parentNode
  }
  return null;
}

/**
 * 路径匹配
 * @param patterns 匹配正则或者路径串数组
 * @param url 需要匹配的url
 * @returns {boolean} 布尔值
 */
const matchPathList = (patterns, url) =>{
  // 空集合直接返回false
  if(patterns == null || patterns.length == 0) {
    return false;
  }
  // 先尝试一下简单匹配，如果可以匹配成功则无需继续模糊匹配
  if (patterns.indexOf(url) >= 0) {
    return true;
  }
  return patterns.findIndex(v => new RegExp(v).test(url)) >= 0
}
/**
 * 常用工具方法集合
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export {
  empty,
  self,
  error,
  deepClone,
  compareObj,
  proxy,
  filter,
  filterProps,
  repeat,
  parsePath,
  once,
  isBlank,
  isEmpty,
  isNull,
  isNotNull,
  isNotEmpty,
  isNotBlank,
  isEmptyObject,
  isNotEmptyObject,
  isVueComponent,
  isFunction,
  isPromise,
  simulatePromise,
  emptyPromise,
  message,
  setMessageComp,
  sure,
  backPrev,
  callback,
  isReserved,
  bind,
  noneValue,
  findNearestComponent,
  matchPathList
}
