import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'

const tempPosition = new Vector3()

export default function BackgroundParticles({ count = 7600 }) {
  const pointsRef = useRef()
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const baseAngles = new Float32Array(count)
    const radii = new Float32Array(count)
    const speeds = new Float32Array(count)
    const offsets = new Float32Array(count)

    const neon = new Color('#c100ff')
    const cyan = new Color('#5ef0ff')
    const deepBlue = new Color('#061857')

    for (let i = 0; i < count; i += 1) {
      const radius = Math.pow(Math.random(), 1.25) * 4.1 + 0.15
      const normalizedRadius = radius / 4.3
      const branchOffset = (Math.random() * 2 - 1) * 0.45
      const angle = Math.random() * Math.PI * 2
      const baseAngle = angle + branchOffset
      const x = Math.cos(angle) * radius
      const y = (Math.random() - 0.5) * radius * 0.12
      const z = Math.sin(angle) * radius * 0.72

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      baseAngles[i] = baseAngle
      radii[i] = radius
      speeds[i] = 0.04 + (1 - normalizedRadius) * 0.09 + Math.random() * 0.02
      offsets[i] = Math.random() * Math.PI * 2

      const color = new Color()
      if (normalizedRadius < 0.38) {
        color.copy(neon).lerp(cyan, normalizedRadius / 0.38)
      } else {
        color.copy(cyan).lerp(deepBlue, (normalizedRadius - 0.38) / 0.62)
      }
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, colors, baseAngles, radii, speeds, offsets }
  }, [count])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const geometry = pointsRef.current?.geometry
    if (!geometry) return

    const positions = geometry.attributes.position.array
    for (let i = 0; i < count; i += 1) {
      const baseAngle = data.baseAngles[i]
      const radius = data.radii[i]
      const speed = data.speeds[i]
      const offset = data.offsets[i]
      const normalizedRadius = radius / 4.3
      const swirl = Math.sin(time * 0.82 + offset) * 0.12 * (1 - normalizedRadius)
      const wobble = Math.cos(time * 0.63 + offset * 1.4) * 0.06
      const pulse = Math.sin(time * 1.7 + offset * 0.9) * 0.02
      const spin = baseAngle + time * speed
      const effectiveRadius = radius + pulse * 0.4

      tempPosition.set(
        Math.cos(spin + swirl) * effectiveRadius * (1 + normalizedRadius * 0.05),
        Math.sin(spin * 0.88 + wobble) * effectiveRadius * 0.28 + Math.sin(time * 0.44 + offset) * 0.03,
        Math.sin(spin * 1.15 + offset * 0.7) * effectiveRadius * 0.18
      )

      positions[i * 3] = tempPosition.x
      positions[i * 3 + 1] = tempPosition.y
      positions[i * 3 + 2] = tempPosition.z
    }

    geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={data.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={data.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.014}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.82}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}
