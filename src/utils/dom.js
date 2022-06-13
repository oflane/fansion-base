/* istanbul ignore next */
const ieVersion = Number(document.documentMode)


/* istanbul ignore next */
/**
 * 添加元素上的事件监听方法
 * @param element html元素
 * @param event 事件名
 * @param handler 监听方法
 */
export const on = (function() {
  if (document.addEventListener) {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
/**
 * 移除元素上的事件监听方法
 * @param element html元素
 * @param event 事件名
 * @param handler 监听方法
 */
export const off = (function() {
  if (document.removeEventListener) {
    return function(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
/**
 * 向元素添加执行一次的事件监听
 * @param el html元素
 * @param event 事件名
 * @param fn 监听方法
 */
export const once = function(el, event, fn) {
  const listener = function() {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/* istanbul ignore next */
/**
 * 判断袁术是否包含指定样式名
 * @param el html元素对象
 * @param cls class样式名
 */
export function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/* istanbul ignore next */
/**
 * 向元素添加class样式
 * @param el html元素对象
 * @param cls class样式名
 */
export function addClass(el, cls) {
  if (!el) return
  let curClass = el.className
  const classes = (cls || '').split(' ')

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.setAttribute('class', curClass)
  }
}

/* istanbul ignore next */
/**
 * 移除元素添加class样式
 * @param el html元素对象
 * @param cls class样式名
 */
export function removeClass(el, cls) {
  if (!el || !cls) return
  const classes = cls.split(' ')
  let curClass = ' ' + el.className + ' '

  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.setAttribute('class', curClass.trim())
  }
}

/* istanbul ignore next */
/**
 * 获取html元素指定样式定义值
 * @param element html袁术
 * @param styleName 样式名
 * @return 样式值
 */
export const getStyle = ieVersion < 9 ? function(element, styleName) {
  if (!element || !styleName) return null
  styleName = styleName.toCamelCase()
  if (styleName === 'float') {
    styleName = 'styleFloat'
  }
  try {
    switch (styleName) {
      case 'opacity':
        try {
          return element.filters.item('alpha').opacity / 100
        } catch (e) {
          return 1.0
        }
      default:
        return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null)
    }
  } catch (e) {
    return element.style[styleName]
  }
} : function(element, styleName) {
  if (isServer) return
  if (!element || !styleName) return null
  styleName = styleName.toCamelCase()
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  } catch (e) {
    return element.style[styleName]
  }
}

/* istanbul ignore next */
/**
 * 设置html元素指定样式值
 * @param element html袁术
 * @param styleName 样式名
 * @param value 样式值
 */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (let prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = styleName.toCamelCase()
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}

/**
 * 判断html袁术是否是可滚动的
 * @param el html元素
 * @param vertical 是否为垂直滚动条
 * @returns {*}
 */
export const isScroll = (el, vertical) => {
  const determinedDirection = vertical !== null && vertical !== undefined
  const overflow = determinedDirection
    ? vertical
      ? getStyle(el, 'overflow-y')
      : getStyle(el, 'overflow-x')
    : getStyle(el, 'overflow')

  return overflow.match(/(scroll|auto|overlay)/)
}

/**
 * 获取当前元素所处的可滚动的容器元素
 * @param el html元素
 * @param vertical 是否为垂直滚动
 * @returns {Window|*}
 */
export const getScrollContainer = (el, vertical) => {
  let parent = el
  while (parent) {
    if ([window, document, document.documentElement].includes(parent)) {
      return window
    }
    if (isScroll(parent, vertical)) {
      return parent
    }
    parent = parent.parentNode
  }
  return parent
}

/**
 * 判断一个元素是否在另一个元素之内
 * @param el html元素
 * @param container 容器元素
 * @returns {boolean} 布尔值
 */
export const isInContainer = (el, container) => {
  if (!el || !container) return false
  const elRect = el.getBoundingClientRect()
  let containerRect
  if ([window, document, document.documentElement, null, undefined].includes(container)) {
    containerRect = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0
    }
  } else {
    containerRect = container.getBoundingClientRect()
  }
  return elRect.top < containerRect.bottom &&
    elRect.bottom > containerRect.top &&
    elRect.right > containerRect.left &&
    elRect.left < containerRect.right
}
