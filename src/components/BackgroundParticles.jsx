import { useMemo, useRef } from 'react'
import { AdditiveBlending, Object3D } from 'three'
import { useFrame } from '@react-three/fiber'

const tempObject = new Object3D()

export default function BackgroundParticles({ count = 150 }) {
  const meshRef = useRef()
  const particles = useMemo(
    () =>
      new Array(count).fill().map(() => ({
        position: [
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 4,
        ],
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.004,
        scale: 0.02 + Math.random() * 0.07,
      })),
    [count]
  )

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (!meshRef.current) return

    particles.forEach((particle, index) => {
      particle.phase += particle.speed * 0.6
      const x = particle.position[0] + Math.sin(time * 0.45 + index) * 0.04
      const y = particle.position[1] + Math.cos(time * 0.35 + index * 0.5) * 0.04
      const z = particle.position[2] + Math.sin(time * 0.52 + index * 0.8) * 0.03
      tempObject.position.set(x, y, z)
      const scale = particle.scale + Math.sin(particle.phase) * 0.01
      tempObject.scale.setScalar(scale)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(index, tempObject.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}> 
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial
        color="#8fe5ff"
        transparent
        opacity={0.78}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
