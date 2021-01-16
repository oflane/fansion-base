/**
* 模块化插件相关方法
* @author Paul.Yang E-mail:yaboocn@qq.com
* @version 1.0 202020/12/23
*/
import Vue from 'vue'
import {isFunction, sure} from './util'

/**
 * 可选模块安装缓存，当安装可选模块时需要将缓存中的数据进行初始化处理
 * @type {{}}
 */
const installCache = {}
/**
 * 根据模块是否安装，对组件进行初始化
 * @param pluginName 模块名
 * @param options 模块选项
 * @param v vue全局对象Vue
 */
const init5Exist = (pluginName, options, v = Vue) => {
  const plugins = v._installedPlugins
  if (options && plugins) {
    const plugin = plugins.find(v => v.name === pluginName)
    if (plugin) {
      v.use(plugin)
      isFunction(plugin.init) && plugin.init(isFunction(options) ? options() : options)
    } else {
      const c = installCache[pluginName] || (sure(installCache[pluginName] = []) && installCache[pluginName])
      c.push(options)
    }
  }
}
/**
 * 获取可插入组件对象
 * @param pluginName 模块名
 * @param v vue全局对象Vue
 */
const getPlugModule = (pluginName, v = Vue) => v._installedPlugins && v._installedPlugins.find(v => v.name === pluginName)

/**
 * 获取安装缓存
 * @param name 插件名称
 * @returns {*}
 */
const getInstallCache = (name) => {
  const c = installCache[name]
  installCache[name] = null
  delete installCache[name]
  return c
}

export default {
  init5Exist,
  getInstallCache,
  getPlugModule
}
