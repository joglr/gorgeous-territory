import React, { useState, useEffect } from 'react'
import { useSpring, useTransition, animated } from 'react-spring/hooks'
import './App.css'
import useKeys from './hooks/use-keys'

const speed = 10
const footprintOccurency = 2
const historyLimit = 10
const frameRate = 60

function transformFromXY(pos) {
  let x, y
  if (pos.constructor === Array) [x, y] = pos
  else [x, y] = Object.values(pos).map(x => x.value)
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate(${CSS.px(Math.floor(x))}, ${CSS.px(Math.floor(y))})`
  }
}

const App = function App() {
  const keys = useKeys(['up', 'down', 'left', 'right', 'space'])
  const [frameCount, setCount] = useState(0)
  const [history, setHistory] = useState([])
  const [pos, setPos] = useState([
    Math.floor(window.innerWidth / 2),
    Math.floor(window.innerHeight / 2)
  ])
  function update() {
    setCount(frameCount + 1)
    const [x, y] = pos
    if (
      !history.find(([otherX, otherY]) => otherX === x && otherY === y) &&
      frameCount % footprintOccurency === 0
    )
      setHistory([...history, pos])
    // else setHistory([])
    if (history.length > historyLimit) setHistory(history.slice(1))
    let diff = [0, 0]

    if (keys.includes('left')) diff[0] = -speed
    if (keys.includes('right')) diff[0] = +speed
    if (keys.includes('up')) diff[1] = -speed
    if (keys.includes('down')) diff[1] = +speed
    const nextPos = [pos[0] + diff[0], pos[1] + diff[1]]

    if (diff[0] !== 0 || diff[1] !== 0) {
      setPos(nextPos)
      setDotProps(nextPos)
    }
  }
  useEffect(
    () => {
      const timeout = setTimeout(update, 1000 / frameRate)
      return () => {
        clearTimeout(timeout)
      }
    },
    [frameCount]
  )
  const arrowMap = {
    up: '↑',
    leftup: '↖',
    rightup: '↗',
    left: '←',
    right: '→',
    downleft: '↙',
    downright: '↘',
    down: '↓'
  }
  const [dotProps, setDotProps] = useSpring(() => pos)
  const historyTransitions = useTransition({
    items: history,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })
  return (
    <div>
      <div>{JSON.stringify(keys)}</div>
      <div>{pos.join(', ')}</div>
      {historyTransitions.map(({ item: [x, y], key, props }) => (
        <animated.div
          key={key}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${CSS.px(x)}, ${CSS.px(y)})`,
            fontSize: '30px',
            ...props
          }}>
          •
        </animated.div>
      ))}
      <animated.div
        style={{
          fontSize: '30px',
          textAlign: 'center',
          color: 'red',
          ...transformFromXY(dotProps)
        }}>
        {arrowMap[
          keys
            .slice()
            .sort()
            .join('')
        ] || '•'}
      </animated.div>
    </div>
  )
}

export default App
