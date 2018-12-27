import React, { useState, useEffect } from 'react'
import { useSpring, useTransition, animated } from 'react-spring/hooks'
import './App.css'
import useKeys from './hooks/use-keys'

const pixelUnit = 20
const footprintOccurency = 2
const historyLimit = 10
const frameRate = 60
const speed = 1 / frameRate
const unitSize = {
  width: CSS.px(pixelUnit),
  height: CSS.px(pixelUnit)
}

function transformFromXY(pos) {
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate(${pos
      .map(v => v * pixelUnit)
      .map(CSS.px)
      .join(', ')})`
  }
}

const roundPixelPosToSquare = pixelPos => pixelPos.map(roundPixelsWithinUnit)
const roundPixelsWithinUnit = pixels =>
  Math.floor(pixels / pixelUnit) * pixelUnit
const toUnits = pixels => Math.floor(pixels / pixelUnit)
const toPixels = units => units * pixelUnit
function generateObstacles({ width, height, amount }) {
  // window size withing maximum amount of units
  const size = [width, height]
  return Array.from(new Array(amount), () =>
    size.map(v => Math.random() * v).map(v => Math.floor(v))
  )
}

const posEquals = ([x, y]) => ([otherX, otherY]) => otherX === x && otherY === y

const obstacles = generateObstacles({
  width: toUnits(window.innerWidth),
  height: toUnits(window.innerHeight),
  amount: 1000
})

const Obstacles = React.memo(function() {
  return (
    <>
      {obstacles.map((pos, key) => (
        <div
          {...key}
          style={{
            ...unitSize,
            ...transformFromXY(
              // roundPosToSquare(
              pos
              // .map(toPixels)
              // )
            )
          }}>
          {'▨'}
        </div>
      ))}
    </>
  )
})

const App = function App() {
  const keys = useKeys(['up', 'down', 'left', 'right', 'space'])
  const [frameCount, setCount] = useState(0)
  const [history, setHistory] = useState([])
  const [pos, setPos] = useState([
    toUnits(Math.floor(window.innerWidth / 2)),
    toUnits(Math.floor(window.innerHeight / 2))
  ])
  function update() {
    setCount(frameCount + 1)
    if (!history.find(posEquals(pos)) && frameCount % footprintOccurency === 0)
      setHistory([...history, pos])
    // else setHistory([])
    if (history.length > historyLimit) setHistory(history.slice(1))
    let diff = [0, 0]

    if (keys.includes('left')) diff[0] = -speed * pixelUnit
    if (keys.includes('right')) diff[0] = +speed * pixelUnit
    if (keys.includes('up')) diff[1] = -speed * pixelUnit
    if (keys.includes('down')) diff[1] = +speed * pixelUnit
    const nextPos = [pos[0] + diff[0], pos[1] + diff[1]]
    const intersectsWithObstacles = obstacles.some(
      posEquals(roundPixelPosToSquare(nextPos.map(toPixels)).map(toUnits))
    )
    if ((diff[0] !== 0 || diff[1] !== 0) && !intersectsWithObstacles) {
      setPos(nextPos)
      setDotProps(nextPos.map(Math.floor))
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
    <div
      style={{
        fontSize: CSS.px(pixelUnit * 1.4),
        lineHeight: CSS.px(pixelUnit * 1.4)
      }}>
      <div>{JSON.stringify(keys)}</div>
      <div>{pos.join(', ')}</div>
      {/* {historyTransitions.map(({ item: [x, y], key, props }) => (
        <animated.div
          key={key}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${CSS.px(x)}, ${CSS.px(y)})`,
            ...props
          }}>
          •
        </animated.div>
      ))} */}
      <animated.div
        style={{
          textAlign: 'center',
          color: 'red',
          ...unitSize,
          ...transformFromXY(Object.values(dotProps).map(({ value }) => value))
        }}>
        {arrowMap[
          keys
            .slice()
            .sort()
            .join('')
        ] || '•'}
      </animated.div>
      <Obstacles />
    </div>
  )
}

export default App
