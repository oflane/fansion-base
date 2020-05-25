/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

import builder from '../utils/builder'
/**
 * 默认对话框
 * @type {string}
 */
const DAFAULT_OPENER = 'default'
/**
 * 对话框容器集合
 * @type {{}}
 */
const openers = {}

/**
 * 根据路径加载页面元数据
 * @param path 页面元数据路径
 * @returns {Object}
 */
const getOpener = (name) => openers[name] || openers[DAFAULT_OPENER]

/**
 * 添加对话框容器
 * @type {*|(function(*=): ({name}|Object))}
 */
const addOpener = builder.register(openers)

/**
 * 设置默认对话框容器
 * @type {*|(function(*=): ({name}|Object))}
 */
const setDefault = opener => (openers[DAFAULT_OPENER] = opener)

/**
 * 取得默认对话框容器
 * @type {*|(function(*=): ({name}|Object))}
 */
const getDefault = () => openers[DAFAULT_OPENER]
/**
 * 对话框容器集合
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2010/24/18
 */
export default {
  /**
   * 对话框容器集合
   */
  openers,
  /**
   * 根据名称获取对话框容器
   */
  getOpener,
  /**
   * 添加对话框容器
   */
  addOpener,
  /**
   * 设置默认的对话框容器
   */
  setDefault,
  /**
   * 取得默认的对话框容器
   */
  getDefault,
  /**
   * 初始化数据
   * @param options
   * @returns {*|{name}|Object}
   */
  init: (options) => {
    if (!options) {
      return
    }
    addOpener(options.openers)
    options.default && setDefault(options.default)
  }
}
