/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

import Vue from 'vue'
import openers from './dialog-openers'
import pages from './pages'
import {isFunction} from '~/utils/util'
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
      const {props, text, html, component, params, dialog, container, title} = d
      let tagName = 'custom-dialog'
      if (container) {
        tagName = typeof container === 'string' ? container.replace('/', '_') : (container.name || container.toString())
        !options.components[name] && (options.components[name] = openers.getOpener(container))
      }
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
    'custom-dialog': (r) => r(openers && openers.getDefault())
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
      const cvn = this._vnode.children
      const $cvm = this.$children
      const cel = this.$el.children
      if (this.$el && this.$el.children.length > 0) {
        let count = 0
        $cvm.forEach(($e, i) => {
          if ($e.isVisible ? $e.isVisible() : cel[i].style.display !== 'none') {
            return
          }
          if (dls[i].dep && document.querySelector(dls[i].dep)) {
            return
          }
          cel[i].remove()
          $cvm.splice(i - count, 1)
          dls.splice(i - count, 1)
          cvn.splice(i - count, 1)
          count++
        })
      }
      let dlg = component
      if (typeof component === 'string') {
        const path = component
        try {
          const {props, component} = pages.getPageMeta(path)
          dlg = {params: props, component}
        } catch (e) {
          const text = path
          dlg = {text}
        }
      } else if (typeof dlg.component === 'string') {
        const {props, component} = pages.getPageMeta(dlg.component)
        props && (dlg.params = dlg.params ? Object.assign(props, dlg.params) : props)
        component && (dlg.component = component)
      }
      const len = dls.length
      if (dlg.component) {
        for (let i = len - 1; i >= 0; i--) {
          if (!dls[i].component) {
            continue
          }
          if (dls[i].component._dlgid !== dlg.component._dlgid) {
            continue
          }
          if (dlg.refresh) {
            cel[i].remove()
            $cvm.splice(i)
            dls.splice(i)
            cvn.splice(i)
          } else {
            this.$children[i].show()
            if (isFunction(dlg['@close'])) {
              this.$children[i].$once('close', () => {
                isFunction(dlg['@close']) && dlg['@close'].apply(arguments)
              })
            }
            this.triggerOpen(dlg)
            return this.$children[i]
          }
        }
      }

      if (dlg.component) {
        dlg.component._dlgid = dialogId++
      }
      dls.push(dlg)
      this._dialogs = dls
    },
    closeCurrent (flag) {
      const c = this.getCurrent()
      if (c) {
        c.hide(flag)
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
