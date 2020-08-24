/* eslint-disable space-in-parens */
/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

import {isFunction} from './util'

/**
 * 获取对象指定属性值
 */
const getData = (obj, name) => obj[name] && isFunction(obj[name]) ? obj[name]() : obj[name]

/**
 * 数据操作常用工具类
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export {
  getData
}
