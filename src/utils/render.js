/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

import Vue from 'vue'
import {repeat} from './util'

/**
 * 模板串转换成vuecomponent的render方法
 * @param vm vue对象
 * @param template 模板串,如果为空则使用options中的template
 * @param components 模板中使用的自定义组件
 */
export const toRender = (vm, template, components) => {
  const options = vm.$options
  const tmpl = template || options.template
  if (!tmpl) {
    return
  }
  const ref = Vue.compile(tmpl, {
    shouldDecodeNewlines: false,
    delimiters: options.delimiters
  }, vm)
  if (components) {
    // eslint-disable-next-line no-prototype-builtins
    if (!options.hasOwnProperty('components')) {
      options.components = Object.create(options.components)
    }
    Object.assign(options.components, components)
  }
  options.render = ref.render
  options.staticRenderFns = ref.staticRenderFns
}

/**
 * 空模板
 * @type {{render(createElement: CreateElement): VNode; staticRenderFns: (() => VNode)[]}}
 */
const emptyRender = Vue.compile('<div></div>')
/**
 * 重试显示方法
 * @param vm
 */
export const resetRender = (vm) => {
  const options = vm.$options
  options.render = emptyRender.render
  options.staticRenderFns = emptyRender.staticRenderFns
}
/**
 * 将配置项转换为属性配置串，如{a:1,b:2}转换为a="1" b="2"
 * @param options {object} 配置项
 * @param exclude {array}排除项目
 * @param alias {object}别名设置
 * @param bind {string} 绑定对象属性
 * @return {string} 属性串
 */
export const toProps = (options, exclude, alias, bind) => {
  if (!options) {
    return ''
  }
  const flag = Array.isArray(exclude)
  if (!alias) {
    alias = {}
  }
  return Object.entries(options).map(([k, v]) => {
    if (flag && exclude.indexOf(k) >= 0) {
      return
    }
    if (alias[k]) {
      k = alias[k]
    }
    if (k.startsWith(':') && bind) {
      return `${k}="${bind}['${k}']"`
    }
    if (typeof v === 'boolean') {
      if (v) {
        return k
      }
    } else if (typeof v === 'number') {
      return `${k}=${v}`
    } else if (v !== null || v !== undefined) {
      return `${k}="${v}"`
    }
  }).join(' ')
}

/**
 * vue的回调钩子
 * @param vm {VueComponent} vue组件
 * @param hook {string} 钩子名称
 */
export function callHook (vm, hook) {
  const handlers = vm.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm)
      } catch (e) {
        handleError(e, vm, (hook + ' hook'))
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
}

/**
 * 刷新vue组件
 * @param vm {VueComponent} vue组件
 */
export function refresh (vm) {
  vm.$mount()
  callHook(vm, 'mounted')
}
/**
 * 强制重新展现，这个主要针对自定义在beforeMount中编译template组件
 * @param vm {VueComponent} vue组件
 */
export function rerender (vm) {
  resetRender(vm)
  vm._update(vm._render(), false)
  vm.$mount()
  if (vm.$vnode) {
    callHook(vm, 'mounted')
  }
}

/**
 * vue的错误处理方法
 * @param err {Error}错误对象
 * @param vm {VueComponent} vue组件
 * @param info {string} 错误信息
 */
export function handleError (err, vm, info) {
  const config = Vue.config
  if (config.errorHandler) {
    config.errorHandler.call(null, err, vm, info)
  } else {
    if (process.env.NODE_ENV !== 'production') {
      warn(('Error in ' + info + ': "' + (err.toString()) + '"'), vm)
    }
    /* istanbul ignore else */
    if (typeof window !== 'undefined' && typeof console !== 'undefined') {
      console.error(err)
    } else {
      throw err
    }
  }
}

/**
 * 格式化vue组件名
 * @param vm {VueComponent} vue组件
 * @param includeFile {boolean} 是否在文件中
 * @returns {string} 组件名串
 */
function formatComponentName (vm, includeFile) {
  if (vm.$root === vm) {
    return '<Root>'
  }
  let name = typeof vm === 'string'
    ? vm
    : typeof vm === 'function' && vm.options
      ? vm.options.name
      : vm._isVue
        ? vm.$options.name || vm.$options._componentTag
        : vm.name

  const file = vm._isVue && vm.$options.__file
  if (!name && file) {
    const match = file.match(/([^/\\]+)\.vue$/)
    name = match && match[1]
  }

  return (
    (name ? ('<' + (name.toClassify()) + '>') : '<Anonymous>') +
    (file && includeFile !== false ? (' at ' + file) : '')
  )
}

/**
 * 警告方法
 * @param msg {string} 消息
 * @param vm {VueComponent} vue组件
 */
function warn (msg, vm) {
  if (typeof console !== 'undefined' && (!Vue.config.silent)) {
    console.error('[Vue warn]: ' + msg + (
      vm ? generateComponentTrace(vm) : ''
    ))
  }
}

/**
 * 生成组件跟踪信息
 * @param vm {VueComponent} vue组件
 * @returns {string} 跟踪信息
 */
function generateComponentTrace (vm) {
  if (!vm._isVue || !vm.$parent) {
    return ('\n\n(found in ' + (formatComponentName(vm)) + ')')
  }
  const tree = []
  let currentRecursiveSequence = 0
  while (vm) {
    if (tree.length > 0) {
      const last = tree[tree.length - 1]
      if (last.constructor === vm.constructor) {
        currentRecursiveSequence++
        vm = vm.$parent
        continue
      } else if (currentRecursiveSequence > 0) {
        tree[tree.length - 1] = [last, currentRecursiveSequence]
        currentRecursiveSequence = 0
      }
    }
    tree.push(vm)
    vm = vm.$parent
  }
  return '\n\nfound in\n\n' + tree.map(function (vm, i) {
    return '' + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm) ? ((formatComponentName(vm[0])) + '... (" + (vm[1]) + " recursive calls)') : formatComponentName(vm))
  }).join('\n')
}
