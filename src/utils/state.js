/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import { deepClone, compareObj } from './util'

/**
 * 观察状态编码处理
 * @param dataName 模型名
 * @param newVal 变化值
 * @param oldVal 旧值
 */
const stateChange = (vm, dataName, newVal, oldVal) => {
  const stateName = '__' + dataName + '_state'
  const originDataName = '__' + dataName + '_data'
  switch (vm[stateName] || 0) {
    case 0:
      vm[stateName] = 1
      vm[originDataName] = deepClone(newVal)
      return
    case 1:
      vm[stateName] = 2
  }
}

/**
 * 为指定模型属性建立watcher
 * @param vm vue实例
 * @param dataName 模型名
 */
const watch = (vm, dataName) => {
  vm.$watch(dataName, (val, oldVal) => {
    stateChange(vm, dataName, val, oldVal)
  }, {deep: true})
}

/**
 * 重置状态为初始化状态
 * @param vm VueModel对象
 * @param dataName 模型名
 */
const reset = (vm, dataName, state = 0) => {
  const stateName = '__' + dataName + '_state'
  const originDataName = '__' + dataName + '_data'
  vm[originDataName] = undefined
  vm[stateName] = state
}

/**
 * 是否当前数据发生编码
 * @param vm VueModel对象
 * @param dataName 模型名
 * @return {boolean} 布尔值
 */
const isChange = (vm, dataName) => {
  const stateName = '__' + dataName + '_state'
  const originDataName = '__' + dataName + '_data'
  if (compareObj({...vm[dataName]}, vm[originDataName])) {
    vm[stateName] = 1
  }
  return vm[stateName] === 2
}

/**
 * 状态管理类
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export default {
  /**
   * 观察状态编码处理
   * @param dataName 模型名
   * @param newVal 变化值
   * @param oldVal 旧值
   */
  stateChange,

  /**
   * 为指定模型属性建立watcher
   * @param vm vue实例
   * @param dataName 模型名
   */
  watch,

  /**
   * 重置状态为初始化状态
   * @param vm VueModel对象
   * @param dataName 模型名
   */
  reset,

  /**
   * 是否当前数据发生编码
   * @param vm VueModel对象
   * @param dataName 模型名
   * @return {boolean} 布尔值
   */
  isChange

}
