/* eslint-disable space-in-parens */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

/**
 * 时间转换方法
 * @param data [Object] 需要格式化的数据
 * @param keyAry [Array[String]]
 */
const timeToStamp = (data, keyAry) => {
  Object.keys(data).forEach(key => {
    if (keyAry.indexOf(key) !== -1 && data[key]) {
      data[key] = new Date(data[key]).getTime()
    }
  })
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
 * @returns {string} 提取后路径
 */
const parsePath = (path) => {
  let r = /(\/[^:]*)\/:(\w+)/.exec(path)
  if (r && r.length > 1) {
    return r[1]
  }
  return path
}

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
const filter = (obj, predicate) => Object.keys(obj)
  .filter(key => predicate(obj, key)).reduce((res, k) => ((res[k] = obj[k])) !== res && res, {})

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
const deepClone = (obj) => {
  let result
  if (Array.isArray(obj)) {
    result = []
    obj.forEach(v => {
      result.push(deepClone(v))
    })
    return result
  }
  let type = typeof obj
  if (type === 'object') {
    result = {}
    Object.entries(obj).forEach(([k, v]) => {
      result[k] = deepClone(v)
    })
    return result
  }
  return obj
}
/**
 * 深度对比两个对象
 * @param left 对象１
 * @param right 对象2
 * @returns {boolean} 是否相等
 */
const compareObj = (left, right) => {
  if (Object.is(left, right) || left === right) {
    return true
  }
  if (isEmpty(left)) {
    return isEmpty(right)
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false
    }
    let r = true
    left.forEach((v, i) => {
      if (!compareObj(v, right[i])) {
        r = false
        return false
      }
    })
    return r
  }
  if (typeof left === 'object' && typeof right === 'object') {
    let r = true
    Object.entries(left).forEach(([k, v]) => {
      if (!compareObj(v, right[k])) {
        r = false
        return false
      }
    })
    return r
  }
  return false
}
/*
仿vue proxy方法，用来处理fac data
*/

/**
 * 空方法
 */
const empty = () => undefined

/**
 * 属性代理对象
 * @type {{set: (function(): undefined), enumerable: boolean, get: (function(): undefined), configurable: boolean}}
 */
let sharedPropertyDefinition = {
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
 * 判断对象是否为vue组件
 * @param v 指定的值
 * @returns {*|boolean}
 */
const isVueComponent = v => v && (typeof v.template === 'string' || typeof v.render === 'function')
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
const simulatePromise = o => new Promise((resolve) => {
  resolve(o)
})

/**
 * 显示信息
 * @param type 信息类型
 * @param message
 */
let message = ({type = 'info', message, items, html = false, autoClose = true}) => {
  alert(message + (items && items.length > 0 ? '\n' + items.join('\n') : ''))
}
/**
 * 设置消息组件
 * @param msg
 * @returns {*}
 */
const setMessageComp = (msg) => (message = msg)
/**
 * 常用工具方法集合
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export {
  empty,
  deepClone,
  compareObj,
  proxy,
  filter,
  filterProps,
  repeat,
  parsePath,
  once,
  timeToStamp,
  isBlank,
  isEmpty,
  isNull,
  isNotNull,
  isNotEmpty,
  isNotBlank,
  isEmptyObject,
  isVueComponent,
  isPromise,
  simulatePromise,
  message,
  setMessageComp
}
