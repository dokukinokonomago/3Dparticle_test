import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import MemorySphere from './MemorySphere'
import BackgroundParticles from './BackgroundParticles'

const targetPosition = { x: 0, y: 0 }

export default function Scene() {
  const group = useRef()
  const pointer = useRef({ x: 0, y: 0 })
  const [touching, setTouching] = useState(false)

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime()
    const floatY = Math.sin(elapsed * 0.75) * 0.24
    const x = MathUtils.lerp(group.current.position.x, pointer.current.x * 0.75, 0.08)
    const y = MathUtils.lerp(group.current.position.y, pointer.current.y * 0.45 + floatY, 0.08)
    group.current.position.x = x
    group.current.position.y = y
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, pointer.current.y * 0.18, 0.05)
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, pointer.current.x * 0.2, 0.05)
  })

  function handlePointerMove(event) {
    event.stopPropagation()
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -(event.clientY / window.innerHeight) * 2 + 1
    pointer.current.x = MathUtils.lerp(pointer.current.x, x, 0.14)
    pointer.current.y = MathUtils.lerp(pointer.current.y, y, 0.14)
  }

  function handlePointerDown(event) {
    event.stopPropagation()
    setTouching(true)
  }

  function handlePointerUp(event) {
    event.stopPropagation()
    setTouching(false)
  }

  return (
    <group ref={group}>
      <mesh
        position={[0, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <MemorySphere active={touching} />
      <BackgroundParticles />
    </group>
  )
}
