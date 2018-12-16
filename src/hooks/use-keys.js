import { useState, useEffect } from 'react'

const _MAP = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta'
}

const removeKey = keys => key => [...keys.filter(x => x !== key)]

function characterFromEvent(e) {
  if (_MAP[e.which]) return _MAP[e.which]
  else return String.fromCharCode(e.which).toLowerCase()
}

const oppositeKeyMap = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
}
function useKeys(keysToUse = []) {
  const [keys, setKeys] = useState([])
  // const [resetTimeout, setResetTimeout] = useState()
  function keyDownHandler(e) {
    // clearTimeout(resetTimeout)
    // setResetTimeout(setTimeout(() => setKeys([]), 2000))
    const key = characterFromEvent(e)
    if (!keys.includes(key) && keysToUse.includes(key)) {
      // console.log(`${key} true`)
      setKeys([...removeKey(keys)(oppositeKeyMap[key]), key])
    }
  }
  function keyUpHandler(e) {
    const key = characterFromEvent(e)
    if (keys.find(x => x === key)) {
      // console.log(`${key} false`)
      setKeys(keys.filter(x => x !== key))
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler)
    window.addEventListener('keyup', keyUpHandler)
    return () => {
      window.removeEventListener('keydown', keyDownHandler)
      window.removeEventListener('keyup', keyUpHandler)
    }
  })
  return keys
}

export default useKeys
