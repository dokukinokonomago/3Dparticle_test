import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

const targetScale = new Vector3()

export default function MemorySphere() {
  const mesh = useRef()
  const [expanded, setExpanded] = useState(false)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const base = expanded ? 1.35 : 1.0
    const breath = 1 + Math.sin(t * 1.9) * 0.032 + Math.cos(t * 2.7) * 0.018
    const scale = base * breath
    targetScale.setScalar(scale)
    mesh.current.scale.lerp(targetScale, 0.1)
    mesh.current.rotation.y += state.delta * 0.34
    mesh.current.rotation.x += state.delta * 0.11
  })

  return (
    <group>
      <pointLight intensity={1.5} distance={8} color="#7ee0ff" position={[0, 1.5, 3]} />
      <pointLight intensity={0.9} distance={6} color="#7eaaff" position={[-2, -1, 1.5]} />
      <mesh
        ref={mesh}
        onClick={(event) => {
          event.stopPropagation()
          setExpanded((current) => !current)
        }}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1.2, 64]} />
        <meshStandardMaterial
          color="#5ba8ff"
          emissive="#9fe9ff"
          emissiveIntensity={1.2}
          roughness={0.14}
          metalness={0.64}
          transparent
          opacity={0.94}
        />
      </mesh>
      <mesh scale={[1.9, 1.9, 1.9]}> 
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshBasicMaterial color="#57a5ff" transparent opacity={0.09} />
      </mesh>
    </group>
  )
}
