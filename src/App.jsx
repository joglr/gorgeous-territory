import React, { useState, useEffect } from 'react'
import { useSpring, useTransition, animated } from 'react-spring/hooks'
import './App.css'
import useKeys from './hooks/use-keys'

const pixelUnit = 20
const footprintOccurency = 50
const obstacleAmount = 100
const historyLimit = 10
const frameRate = 60
const speed = 1 / frameRate
const unitSize = {
  width: CSS.px(pixelUnit),
  height: CSS.px(pixelUnit)
}

const generateKey = () => (Math.random() * 10 ** 6).toString(36)

const items = [
  { content: '🥕', edible: true },
  { content: '🍌', edible: true },
  { content: '🍎', edible: true },
  { content: '🌴', edible: false },
  { content: '🗻', edible: false },
  { content: '🏡', edible: false },
  { content: '🏠', edible: false },
  { content: '🌲', edible: false },
  { content: '🌲', edible: false },
  { content: '🌲', edible: false },
  { content: '🌲', edible: false },
  { content: '🌲', edible: false },
  { content: '🌲', edible: false },
  { content: '🌳', edible: false },
  { content: '🌳', edible: false },
  { content: '🌳', edible: false },
  { content: '🌳', edible: false },
  { content: '🌳', edible: false },
  { content: '🌳', edible: false }
]

const toUnits = pixels => Math.floor(pixels / pixelUnit)
const toPixels = units => units * pixelUnit

function transformFromXY(pos) {
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate(${pos
      .map(toPixels)
      .map(CSS.px)
      .join(', ')})`
  }
}

function generateObstacles({ width, height, amount }) {
  // window size withing maximum amount of units
  const size = [width, height]
  return Array.from(new Array(amount), () => ({
    pos: size.map(v => Math.random() * v).map(v => Math.floor(v)),
    key: generateKey(),
    ...items[Math.floor(Math.random() * items.length)]
  }))
}

const posEquals = ([x, y]) => ([otherX, otherY]) => otherX === x && otherY === y

const Obstacles = React.memo(function({ obstacles }) {
  return (
    <>
      {obstacles.map(({ pos, content }, key) => (
        <div
          {...key}
          style={{
            ...unitSize,
            ...transformFromXY(pos)
          }}>
          {content}
        </div>
      ))}
    </>
  )
})

const App = function App() {
  const keys = useKeys(['up', 'down', 'left', 'right', 'space'])
  const [frameCount, setCount] = useState(0)
  const [history, setHistory] = useState([])
  const [obstacles, setObstacles] = useState(
    generateObstacles({
      width: toUnits(window.innerWidth),
      height: toUnits(window.innerHeight),
      amount: obstacleAmount
    })
  )
  const [pos, setPos] = useState([
    toUnits(Math.floor(window.innerWidth / 2)),
    toUnits(Math.floor(window.innerHeight / 2))
  ])
  function update() {
    setCount(frameCount + 1)
    if (
      !history.find(({ pos: otherPos }) => posEquals(pos)(otherPos)) &&
      frameCount % footprintOccurency === 0
    )
      setHistory([...history, { pos: pos.map(Math.floor), key: generateKey() }])
    if (history.length > historyLimit) setHistory(history.slice(1))
    let diff = [0, 0]

    if (keys.includes('left')) diff[0] = -speed * pixelUnit
    if (keys.includes('right')) diff[0] = +speed * pixelUnit
    if (keys.includes('up')) diff[1] = -speed * pixelUnit
    if (keys.includes('down')) diff[1] = +speed * pixelUnit
    const nextPos = [pos[0] + diff[0], pos[1] + diff[1]]
    const foundObstacle = obstacles.find(({ pos }) =>
      posEquals(nextPos.map(Math.floor))(pos)
    )
    if (
      diff[0] !== 0 ||
      (diff[1] !== 0 && (!foundObstacle || foundObstacle.edible))
    ) {
      setPos(nextPos)
      setDotProps(nextPos.map(Math.floor))
      if (foundObstacle && foundObstacle.edible) {
        setObstacles(obstacles.filter(x => x.key !== foundObstacle.key))
      }
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
  const [dotProps, setDotProps] = useSpring(() => pos)
  return (
    <div
      style={{
        fontSize: CSS.px(pixelUnit * 1.4),
        fontFamily: 'Consolas',
        lineHeight: CSS.px(pixelUnit * 1.4)
      }}>
      {history.map(({ pos, key }) => (
        <div
          key={key}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            fontSize: 10,
            ...unitSize,
            ...transformFromXY(pos)
            // ...props
          }}>
          {'💩'}
        </div>
      ))}
      <animated.div
        style={{
          textAlign: 'center',
          color: 'red',
          ...unitSize,
          ...transformFromXY(Object.values(dotProps).map(({ value }) => value))
        }}>
        {'🐇'}
      </animated.div>
      <Obstacles obstacles={obstacles} />
    </div>
  )
}

export default App
