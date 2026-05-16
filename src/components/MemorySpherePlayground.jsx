import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense, useState } from 'react'
import Scene from './Scene'

const viewPresets = {
  default: { theta: Math.PI / 4, phi: Math.PI / 2.4, distance: 6, label: 'Perspective' },
  top: { theta: 0, phi: Math.PI / 2.8, distance: 5, label: 'Top' },
  side: { theta: Math.PI / 2, phi: Math.PI / 2.4, distance: 6, label: 'Side' },
  front: { theta: Math.PI / 4, phi: Math.PI / 2.2, distance: 5.5, label: 'Front' },
}

export default function MemorySpherePlayground() {
  const [cameraState, setCameraState] = useState(viewPresets.default)

  const handlePreset = (key) => {
    setCameraState(viewPresets[key])
  }

  const handleZoom = (delta) => {
    setCameraState((prev) => ({
      ...prev,
      distance: Math.min(12, Math.max(3, prev.distance + delta)),
    }))
  }

  const handleReset = () => {
    setCameraState(viewPresets.default)
  }

  return (
    <div className="playground-shell">
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
          <Scene cameraState={cameraState} setCameraState={setCameraState} />
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
      <div className="playground-ui">
        <div className="control-panel">
          <div className="panel-title">VIEW CONTROLS</div>
          <div className="button-row">
            {Object.entries(viewPresets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePreset(key)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="zoom-row">
            <button type="button" onClick={() => handleZoom(-0.6)}>-</button>
            <span>Zoom</span>
            <button type="button" onClick={() => handleZoom(0.6)}>+</button>
          </div>
          <div className="button-row">
            <button type="button" onClick={handleReset}>RESET</button>
          </div>
          <div className="hint">Drag to orbit • Wheel to zoom</div>
        </div>
      </div>
    </div>
  )
}
