import React, { useState, useEffect } from 'react'
import { useSpring, animated } from 'react-spring/hooks'
import './App.css'
import useKeys from './hooks/use-keys'
import emoji from 'emoji-dictionary'

const pixelUnit = 30
const obstacleFrequency = 1 / 3
const frameRate = 60
const speed = (1 / frameRate) * 20
const playerContent = '🐇'
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
const dangerousStyles = {
  filter: 'drop-shadow(0px 0px 5px red)'
}

const PROPERTIES = {
  EDIBLE: 'edible',
  SOLID: 'solid',
  DANGEROUS: 'dangerous',
  SLOW: 'slow'
}

const items = [
  { content: '🥕', properties: [PROPERTIES.EDIBLE] },
  { content: '🍌', properties: [PROPERTIES.EDIBLE] },
  { content: '🍎', properties: [PROPERTIES.EDIBLE] },
  { content: '🗻', properties: [PROPERTIES.SOLID] },
  { content: '🌴', properties: [PROPERTIES.SOLID] },
  { content: '🏡', properties: [PROPERTIES.SOLID] },
  { content: '�', properties: [PROPERTIES.SOLID] },
  { content: '�', properties: [PROPERTIES.SOLID] },
  { content: '🌲', properties: [PROPERTIES.SOLID] },
  { content: '🌲', properties: [PROPERTIES.SOLID] },
  { content: '🌲', properties: [PROPERTIES.SOLID] },
  { content: '🌲', properties: [PROPERTIES.SOLID] },
  { content: '🌲', properties: [PROPERTIES.SOLID] },
  { content: '�', properties: [PROPERTIES.SOLID] },
  { content: '🌳', properties: [PROPERTIES.SOLID] },
  { content: '🌳', properties: [PROPERTIES.SOLID] },
  { content: '🌳', properties: [PROPERTIES.SOLID] },
  { content: '🌳', properties: [PROPERTIES.SOLID] },
  { content: '🌳', properties: [PROPERTIES.SOLID] },
  { content: '🐍', properties: [PROPERTIES.SOLID, PROPERTIES.DANGEROUS] },
  { content: '🐉', properties: [PROPERTIES.SOLID, PROPERTIES.DANGEROUS] },
  { content: '🦀', properties: [PROPERTIES.SOLID, PROPERTIES.DANGEROUS] },
  { content: '🕷', properties: [PROPERTIES.SOLID, PROPERTIES.DANGEROUS] },
  { content: '🦂', properties: [PROPERTIES.SOLID, PROPERTIES.DANGEROUS] },
  { content: '🐊', properties: [PROPERTIES.SOLID, PROPERTIES.DANGEROUS] },
  { content: '🕸', properties: [PROPERTIES.SLOW] }
]

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
            ...items[Math.floor(Math.random() * items.length)]
          })
        }
      }
    }
    return obstacles
  }
}

const getComponentPropsFromObject = (
  { pos, content, properties },
  { style, ...props } = {}
) => ({
  key: pos.join(),
  title: emoji.getName(content),
  style: {
    ...objectStyles,
    ...transformFromXY(pos),
    ...style,
    ...(properties && properties.includes(PROPERTIES.DANGEROUS)
      ? dangerousStyles
      : {})
  },
  ...props
})

const posEquals = ([x, y]) => ([otherX, otherY]) => otherX === x && otherY === y

const MemoedObstacles = React.memo(function({ obstacles }) {
  return (
    <>
      {obstacles.map(object => (
        <div {...getComponentPropsFromObject(object)}>{object.content}</div>
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

    if (keys.includes('left')) diff[0] = -speed
    if (keys.includes('right')) diff[0] = +speed
    if (keys.includes('up')) diff[1] = -speed
    if (keys.includes('down')) diff[1] = +speed
    const nextPos = addVector(pos, diff)
    const foundObstacle = obstacles.find(({ pos }) =>
      posEquals(nextPos.map(Math.floor))(pos)
    )
    if (
      (diff[0] !== 0 || diff[1] !== 0) &&
      (!foundObstacle || !foundObstacle.properties.includes(PROPERTIES.SOLID))
    ) {
      setPos(nextPos)
      setDotProps(nextPos.map(Math.floor))
      if (
        foundObstacle &&
        foundObstacle.properties.includes(PROPERTIES.EDIBLE)
      ) {
        setObstacles(
          obstacles.filter(
            x =>
              getComponentPropsFromObject(x).key !==
              getComponentPropsFromObject(foundObstacle).key
          )
        )
        setHistory([...history, { pos: foundObstacle.pos }])
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
        fontFamily: 'Consolas',
        background: 'hsl(156, 100%, 75%)',
        height: '100vh'
      }}>
      {history.map(object => (
        <div
          {...getComponentPropsFromObject(object, {
            style: {
            fontSize: 10,
            alignItems: 'flex-end'
            }
          })}>
          {'💩'}
        </div>
      ))}
      <animated.div
        {...getComponentPropsFromObject({
          pos: Object.values(dotProps).map(({ value }) => value),
          content: playerContent
        })}>
        {playerContent}
      </animated.div>
      <MemoedObstacles obstacles={obstacles} />
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
