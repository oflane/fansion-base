/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

/**
 * 脚本操作
 * @author Paul.Yang E-mail:yaboocn@qq.com
 * @version 1.0 2010/18/18
 */
/**
 * 创建script
 * @param url
 * @returns {Promise}
 */
function load (url, cb) {
  let scriptEle = document.createElement('script')
  document.body.appendChild(scriptEle)

  let promise = new Promise((resolve, reject) => {
    scriptEle.addEventListener('load', e => {
      removeScript(scriptEle)
      if (!cb) {
        resolve(e)
      }
    }, false)

    scriptEle.addEventListener('error', e => {
      removeScript(scriptEle)
      reject(e)
    }, false)

    if (cb) {
      window.____callback____ = function () {
        resolve()
        window.____callback____ = null
      }
    }
  })
  if (cb) {
    url += '&callback=____callback____'
  }
  scriptEle.src = url
  return promise
}

/**
 * 移除script标签
 * @param scriptElement script dom
 */
function removeScript (scriptElement) {
  document.body.removeChild(scriptElement)
}

export default {
  load
}
