/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

import Vue from 'vue'
import dialog from './dialog'
import {isFunction, isVueComponent} from '~/utils/util'
import {getData} from '~/utils/data'
/**
 * 对话框id计数器
 * @type {number}
 */
let dialogId = 0

/**
 * 对话框管理
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2017-7-18
 */
export default {
  render: function (createElement) {
    const options = this.$options
    function createDialog (d) {
      const { text, html, component, params, dialog, container} = d
      let {title, props} = d
      let tagName = 'custom-dialog'
      if (container) {
        if (typeof container === 'string') {
          tagName = container.replace('/', '_') + component._dlgid
          if (!options.components[tagName]) {
            options.components[tagName] = dialog.getOpener(container)
          }
        } else if (isVueComponent(container)) {
          if (container.name) {
            tagName = container.name
          }
          tagName = tagName + component._dlgid
          options.components[tagName] = container
        }
      }
      if (!title) {
        title = component.title ? component.title : component.label ? component.label : component.name
      }
      const dp = getData(component, 'dailogProps')
      dp && (props = props ? Object.assign(props, dp) : dp)
      const on = {}
      if (d['@open']) {
        on.open = d['@open']
      }
      if (d['@close']) {
        on.close = d['@close']
      }
      return createElement(tagName, {props: {dialogProps: props, component, text, html, params, dialog, title}, on})
    }
    const dialogs = this._dialogs
    // resolve props
    return createElement('div', {id: 'ss'}, dialogs.map((d) => {
      return createDialog(d)
    }))
  },
  props: {
    opener: Object
  },
  components: {
    'custom-dialog': (r) => r(dialog && dialog.getDefault())
  },
  created () {
    const $dialogs = this
    Vue.util.defineReactive(this, '_dialogs', [])
    function showDialog (component) {
      $dialogs.show(component)
    }
    Vue.prototype.$showDialog = showDialog
    Object.defineProperty(Vue.prototype, '$dialogs', {
      get () { return $dialogs }
    })
  },
  updated () {
    if (this.showing) {
      this.triggerOpen(this.showing)
      this.showing = undefined
    }
  },
  methods: {
    triggerOpen (dialog) {
      const f = dialog['@open']
      isFunction(f) && f()
    },
    show (component) {
      const dls = this._dialogs
      const dlg = dialog.buildDialogMeta(component)
      if (dlg.component) {
        dlg.component._dlgid = dialogId++
      }
      dls.push(dlg)
      const cvn = this._vnode.children
      const $cvm = this.$children
      const cel = this.$el.children
      if (this.$el && this.$el.children.length > 0) {
        let len = this.$el.children.length
        for (let i = 0; i < len; i++) {
          const $e = $cvm[i]
          if ($e.isVisible ? $e.isVisible() : cel[i].style.display !== 'none') {
            continue
          }
          if (dls[i].dep && document.querySelector(dls[i].dep)) {
            continue
          }
          $cvm.splice(i, 1)
          Vue.nextTick(() => $e.$destroy())
          cel[i].remove()
          dls.splice(i, 1)
          cvn.splice(i, 1)
          len--
          i--
        }
      }
    },
    closeCurrent (data) {
      const c = this.getCurrent()
      if (c) {
        c.hide(data)
      }
    },
    getCurrent () {
      const $children = this.$children
      if ($children.length === 0) {
        return
      }
      for (let i = $children.length - 1; i >= 0; i--) {
        const c = $children[i]
        if (c.isVisible()) {
          return c
        }
      }
    }
  }
}
