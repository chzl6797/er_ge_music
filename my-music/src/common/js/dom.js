/**
 * 给dom元素添加类名
 * @param {dom} el 
 * @param {string} className 
 */
export function addClass(el, className) {
  el.classList.add(className)
}

/**
 * 设置或者获取dom元素的data-属性
 * @param {dom} el 
 * @param {string} name 
 * @param {*} val 
 */
export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  
  if(val) {
    return el.setAttribute(name, val)
  }else {
    return el.getAttribute(name)
  }
}

/**
 * 获取属性的前缀
 */
let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit  : 'webkitTransform',
    Moz     : 'MozTransform',
    O       : 'OTransform',
    ms      : 'msTransform',
    standard: 'transform'
  }

  for (const key in transformNames) {
    if(elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

/**
 * css3属性添加前缀
 * @param {any} style 
 */
export function prefixStyle(style) {
  if(vendor === false) {
    false
  }

  if(vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}