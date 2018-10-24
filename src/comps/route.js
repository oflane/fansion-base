/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
import Vue from 'vue'
import Router from 'vue-router'
import {getJson} from '../utils/rest'
import page from './page'
/**
 * 路由扩展工具类
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2018-6-15
 */
export default ({loader, routes, parser, pageLoader}) => {
  if (typeof pageLoader !== 'function') {
    pageLoader = page.getPageMeta
  }
  let parsers = [
    (path) => {
      let i = path.indexOf('->')
      let target = path
      let eq = true
      if (i > 0) {
        target = path.substring(i + 2)
        path = path.substring(0, i)
        eq = false
      }
      let isDirect
      let isKeep
      while ((!isDirect && (isDirect = target.startsWith('!'))) || (!isKeep && (isKeep = target.startsWith('^')))) {
        target = target.substring(1)
      }
      if (eq) {
        path = target
      }
      if (isDirect) {
        if (eq) {
          throw new Error('Redirect path can nott equal to target,please redirect path!!')
        }
        return {
          path,
          redirect: target
        }
      }
      console.log('==>' + isKeep)
      return Object.assign({
        path,
        meta: {
          keepAlive: isKeep
        }
      }, pageLoader(target))
    }
  ]
  parser && parsers.splice(0, 0, parser)
  let loaders = []
  if (Array.isArray(loader) && loaders.length > 0) {
    loader.forEach(v => {
      if (Promise.isPrototypeOf(v)) {
        loaders.push(v)
      } else if (typeof v === 'string') {
        loaders.push(getJson(v))
      } else if (typeof v === 'function') {
        loaders.push(new Promise((resolve, reject) => resolve(v())))
      }
    })
  } else if (Promise.isPrototypeOf(loader)) {
    loaders.push(loader)
  } else if (typeof loader === 'string') {
    loaders.push(getJson(loader))
  } else if (typeof loader === 'function') {
    loaders.push(new Promise((resolve) => resolve(loader())))
  }
  if (Array.isArray(routes) && routes.length > 0) {
    loaders.push(new Promise((resolve) => resolve(routes)))
  }
  Vue.use(Router)
  let router = new Router({
    base: '/',
    mode: 'hash'
  })

  let parse
  if (parsers.length === 1) {
    parse = parsers[0]
  } else {
    parse = path => {
      let rs
      parsers.some(p => {
        rs = p(path)
        return rs !== null
      })
    }
  }
  let addRoutes = (rs) => {
    router.addRoutes(rs.map(v => {
      return parse(v)
    }))
  }
  if (loaders.length === 1) {
    loaders[0].then(addRoutes)
  } else if (loaders.length > 1) {
    Promise.all(loaders).then(r => addRoutes(Array.concat(...r)))
  }
}
