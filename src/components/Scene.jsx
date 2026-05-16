import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, MathUtils, Vector3 } from 'three'
import BackgroundParticles from './BackgroundParticles'

const defaultState = {
  theta: Math.PI / 4,
  phi: Math.PI / 2.4,
  distance: 6,
}

function CentralGlowCluster() {
  const ref = useRef()
  const data = useMemo(() => {
    const count = 260
    const positions = new Float32Array(count * 3)
    const radii = [0.14, 0.185, 0.235]

    for (let i = 0; i < count; i += 1) {
      const layer = Math.floor((i / count) * radii.length)
      const radius = radii[layer] + (Math.random() - 0.5) * 0.02
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const jitter = 0.03 * Math.random()
      const x = Math.sin(phi) * Math.cos(theta) * radius + (Math.random() - 0.5) * jitter
      const y = Math.sin(phi) * Math.sin(theta) * radius + (Math.random() - 0.5) * jitter
      const z = Math.cos(phi) * radius + (Math.random() - 0.5) * jitter
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
    }

    return { positions, count }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y += state.delta * 0.14
    ref.current.rotation.x += state.delta * 0.03
  })

  return (
    <group>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={data.count} array={data.positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.88}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
      <mesh>
        <sphereGeometry args={[0.065, 24, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshBasicMaterial color="#cde9ff" transparent opacity={0.08} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function Scene({ cameraState, setCameraState }) {
  const { camera } = useThree()
  const [dragging, setDragging] = useState(false)
  const pointerStart = useRef({ x: 0, y: 0, theta: defaultState.theta, phi: defaultState.phi })
  const target = useRef({ ...defaultState })

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
      <CentralGlowCluster />
      <BackgroundParticles />
    </group>
  )
}
