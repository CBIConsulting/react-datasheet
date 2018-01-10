export const dispatchKeyDownEvent = (key, shift=false) => {
  const e = document.createEvent('KeyboardEvent');
  Object.defineProperty(e, 'keyCode', {
    get: () => key
  })
  Object.defineProperty(e, 'shiftKey', {
    get: () => shift
  })
  e.initEvent('keydown', true, true)
  document.dispatchEvent(e)
}
  
export const triggerMouseEvent = (node, eventType) => {
  const clickEvent = document.createEvent('MouseEvents')
  clickEvent.initEvent(eventType, true, true)
  node.dispatchEvent(clickEvent)
}