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