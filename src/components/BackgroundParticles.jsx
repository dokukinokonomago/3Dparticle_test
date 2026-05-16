import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, Object3D } from 'three'
import { useFrame } from '@react-three/fiber'

const tempObject = new Object3D()

export default function BackgroundParticles({ count = 7000 }) {
  const meshRef = useRef()
  const particles = useMemo(() => {
    const neon = new Color('#c100ff')
    const cyan = new Color('#5ef0ff')
    const deepBlue = new Color('#061857')

    return new Array(count).fill().map(() => {
      const radius = Math.pow(Math.random(), 1.25) * 4.2 + 0.2
      const normalizedRadius = radius / 4.5
      const baseAngle = Math.random() * Math.PI * 2
      const tension = Math.random() * 0.8 + 0.2
      const speed = 0.08 + (1 - normalizedRadius) * 0.18
      const color = new Color()

      if (normalizedRadius < 0.5) {
        color.copy(neon).lerp(cyan, normalizedRadius * 2)
      } else {
        color.copy(cyan).lerp(deepBlue, (normalizedRadius - 0.5) * 2)
      }

      return {
        radius,
        normalizedRadius,
        baseAngle,
        phase: Math.random() * Math.PI * 2,
        speed,
        tension,
        scale: 0.011 + Math.random() * 0.009,
        color,
      }
    })
  }, [count])

  useEffect(() => {
    if (!meshRef.current) return
    particles.forEach((particle, index) => {
      meshRef.current.setColorAt(index, particle.color)
    })
    if (meshRef.current?.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [particles])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (!meshRef.current) return

    particles.forEach((particle, index) => {
      const spin = particle.baseAngle + time * particle.speed
      const swirl = Math.sin(time * 0.8 + particle.phase) * 0.15 * particle.tension
      const drift = Math.cos(time * 0.6 + particle.phase * 1.3) * 0.08
      const radius = particle.radius + Math.sin(time * 0.4 + particle.phase) * 0.02

      const x = Math.cos(spin + swirl) * radius * (1 + particle.normalizedRadius * 0.08)
      const y = Math.sin(spin * 0.9 + drift) * radius * 0.38 + Math.sin(time * 0.5 + particle.phase) * 0.05
      const z = Math.sin(spin * 1.2 + particle.phase * 0.7) * radius * 0.22
      const scale = particle.scale * (1 + Math.sin(time * 1.5 + particle.phase) * 0.32)

      tempObject.position.set(x, y, z)
      tempObject.scale.setScalar(scale)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(index, tempObject.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.75}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
