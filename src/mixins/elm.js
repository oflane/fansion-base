/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

/**
 * 全局mixin用于设置元素id
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2017-7-26
 */
export default {
  mounted: function () {
    if (this.$el && !this.$el.id) {
      this.$el.id = 'c' + this._uid
    }
  },
  updated: function () {
    if (!this.$el.id) {
      this.$el.id = 'c' + this._uid
    }
  },
  methods: {
    /**
     * 取得元素id
     * @returns {string}
     */
    getElmID: function () {
      if (this.$el) {
        return this.$el.id
      }
      return 'c' + this._uid
    }
  }
}
