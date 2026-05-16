import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BufferAttribute, LineBasicMaterial, MathUtils, Vector3 } from 'three'
import BackgroundParticles from './BackgroundParticles'

const defaultState = {
  theta: Math.PI / 4,
  phi: Math.PI / 2.4,
  distance: 6,
}

export default function Scene({ cameraState, setCameraState }) {
  const { camera } = useThree()
  const [dragging, setDragging] = useState(false)
  const pointerStart = useRef({ x: 0, y: 0, theta: defaultState.theta, phi: defaultState.phi })
  const target = useRef({ ...defaultState })
  const axisPositions = useMemo(() => {
    const points = []
    const length = 3.5
    const tickCount = 6
    points.push(0, 0, 0, length, 0, 0)
    points.push(0, 0, 0, 0, length, 0)
    points.push(0, 0, 0, 0, 0, length)

    for (let i = 1; i <= tickCount; i += 1) {
      const t = (length / tickCount) * i
      const s = 0.08
      points.push(t, 0, 0, t, s, 0)
      points.push(t, 0, 0, t, 0, s)
      points.push(0, t, 0, s, t, 0)
      points.push(0, t, 0, 0, t, s)
      points.push(0, 0, t, s, 0, t)
      points.push(0, 0, t, 0, s, t)
    }

    return new Float32Array(points)
  }, [])

  useEffect(() => {
    target.current = { ...cameraState }
  }, [cameraState])

  useFrame(() => {
    const { theta, phi, distance } = target.current
    const phiClamped = MathUtils.clamp(phi, Math.PI * 0.18, Math.PI * 0.94)
    const x = distance * Math.sin(phiClamped) * Math.cos(theta)
    const y = distance * Math.cos(phiClamped)
    const z = distance * Math.sin(phiClamped) * Math.sin(theta)

    const nextPos = new Vector3(x, y, z)
    camera.position.lerp(nextPos, 0.1)
    camera.lookAt(0, 0, 0)
  })

  const handlePointerDown = (event) => {
    event.stopPropagation()
    setDragging(true)
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      theta: target.current.theta,
      phi: target.current.phi,
    }
  }

  const handlePointerMove = (event) => {
    if (!dragging) return
    event.stopPropagation()
    const dx = (event.clientX - pointerStart.current.x) / window.innerWidth
    const dy = (event.clientY - pointerStart.current.y) / window.innerHeight
    const nextTheta = pointerStart.current.theta - dx * Math.PI
    const nextPhi = MathUtils.clamp(pointerStart.current.phi + dy * Math.PI, Math.PI * 0.18, Math.PI * 0.94)
    target.current.theta = nextTheta
    target.current.phi = nextPhi
    setCameraState((prev) => ({ ...prev, theta: nextTheta, phi: nextPhi }))
  }

  const handlePointerUp = (event) => {
    event.stopPropagation()
    setDragging(false)
  }

  const handleWheel = (event) => {
    event.preventDefault()
    const nextDistance = MathUtils.clamp(target.current.distance + event.deltaY * 0.004, 3, 12)
    target.current.distance = nextDistance
    setCameraState((prev) => ({ ...prev, distance: nextDistance }))
  }

  return (
    <group>
      <mesh
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={axisPositions.length / 3} array={axisPositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#5ef0ff" transparent opacity={0.5} toneMapped={false} />
      </lineSegments>
      <BackgroundParticles />
    </group>
  )
}
