import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense } from 'react'
import Scene from './Scene'

export default function MemorySpherePlayground() {
  return (
    <Canvas
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 6], fov: 40 }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <color attach="background" args={['#000']} />
      <fog attach="fog" args={['#000', 4, 12]} />
      <ambientLight intensity={0.18} />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.18}
          luminanceSmoothing={0.95}
          intensity={1.2}
          radius={0.85}
        />
      </EffectComposer>
    </Canvas>
  )
}
