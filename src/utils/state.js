/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import { deepClone, compareObj } from './util'
/**
 * 状态管理类
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export default {

  /**
   * 为指定模型属性建立watcher
   * @param vm vue实例
   * @param dataName 模型名
   */
  watch: (vm, dataName) => {
    let wm = this
    vm.$watch(dataName, (val, oldVal) => {
      wm.stateChange(this, dataName, val, oldVal)
    }, {deep: true})
  },
  /**
   * 观察状态编码处理
   * @param dataName 模型名
   * @param newVal 变化值
   * @param oldVal 旧值
   */
  stateChange: (vm, dataName, newVal, oldVal) => {
    let stateName = '__' + dataName + '_state'
    let originDataName = '__' + dataName + '_data'
    let state = vm[stateName]
    if (!state || state === 0) {
      vm[stateName] = 1
      vm[originDataName] = deepClone(newVal)
    } else if (state === 1) {
      vm[stateName] = 2
    }
  },
  /**
   * 重置状态为初始化状态
   * @param vm VueModel对象
   * @param dataName 模型名
   */
  reset: (vm, dataName, state = 0) => {
    let stateName = '__' + dataName + '_state'
    let originDataName = '__' + dataName + '_data'
    vm[originDataName] = undefined
    vm[stateName] = state
  },

  /**
   * 是否当前数据发生编码
   * @param vm VueModel对象
   * @param dataName 模型名
   * @return {boolean} 布尔值
   */
  isChange: (vm, dataName) => {
    let stateName = '__' + dataName + '_state'
    let originDataName = '__' + dataName + '_data'
    if (compareObj({...vm[dataName]}, vm[originDataName])) {
      vm[stateName] = 1
    }
    return vm[stateName] === 2
  }
}
