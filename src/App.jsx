import React, { useState, useEffect } from 'react'
import { useSpring, animated } from 'react-spring/hooks'
import './App.css'
import useKeys from './hooks/use-keys'

const pixelUnit = 20
const obstacleFrequency = 1 / 5
const frameRate = 60
const speed = 1 / frameRate
const objectStyles = {
  width: CSS.px(pixelUnit),
  height: CSS.px(pixelUnit),
  position: 'absolute',
  left: 0,
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: '100%'
}

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

const generateKey = () => (Math.random() * 10 ** 6).toString(36)
const toUnits = pixels => Math.floor(pixels / pixelUnit)
const toPixels = units => units * pixelUnit
const addVector = ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2]

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

function generateObstaclesFactory({ width, height, amount }) {
  return () => {
    let obstacles = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.random() < obstacleFrequency) {
          obstacles.push({
            pos: [x, y],
            key: generateKey(),
            ...items[Math.floor(Math.random() * items.length)]
          })
        }
      }
    }
    return obstacles
  }
}

const posEquals = ([x, y]) => ([otherX, otherY]) => otherX === x && otherY === y

const Obstacles = React.memo(function({ obstacles }) {
  return (
    <>
      {obstacles.map(({ pos, content }, key) => (
        <div
          key={pos.join()}
          style={{
            ...objectStyles,
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
  const generateObstacles = generateObstaclesFactory({
    width: toUnits(window.innerWidth),
    height: toUnits(window.innerHeight),
    amount: Math.floor(
      toUnits(window.innerWidth) *
        toUnits(window.innerHeight) *
        obstacleFrequency
    )
  })
  const [obstacles, setObstacles] = useState(generateObstacles())
  const [pos, setPos] = useState([
    toUnits(Math.floor(window.innerWidth / 2)),
    toUnits(Math.floor(window.innerHeight / 2))
  ])
  useEffect(() => {
    function handleResize() {
      setObstacles(generateObstacles())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })
  function update() {
    setCount(frameCount + 1)
    let diff = [0, 0]

    if (keys.includes('left')) diff[0] = -speed * pixelUnit
    if (keys.includes('right')) diff[0] = +speed * pixelUnit
    if (keys.includes('up')) diff[1] = -speed * pixelUnit
    if (keys.includes('down')) diff[1] = +speed * pixelUnit
    const nextPos = addVector(pos, diff)
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
        setHistory([...history, { pos: foundObstacle.pos, key: generateKey() }])
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
        fontSize: CSS.px(pixelUnit),
        fontFamily: 'Consolas'
      }}>
      {history.map(({ pos, key }) => (
        <div
          key={pos.join()}
          style={{
            ...objectStyles,
            ...transformFromXY(pos),
            fontSize: 10,
            alignItems: 'flex-end'
          }}>
          {'💩'}
        </div>
      ))}
      <animated.div
        style={{
          ...objectStyles,
          ...transformFromXY(Object.values(dotProps).map(({ value }) => value)),
          textAlign: 'center',
          color: 'red'
        }}>
        {'🐇'}
      </animated.div>
      <Obstacles obstacles={obstacles} />
      <div
        style={{
          position: 'absolute'
        }}>
        noms: {history.length}
      </div>
    </div>
  )
}

export default App
