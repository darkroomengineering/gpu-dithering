import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useCanvas } from '../../hooks/use-canvas'
import { PostProcessing } from '../postprocessing'
import { RAF } from '../raf'
import s from './webgl.module.scss'

export function WebGLCanvas() {
  const { WebGLTunnel, DOMTunnel } = useCanvas()

  return (
    <div className={s.webgl}>
      <Canvas
        gl={{
          powerPreference: 'high-performance',
          antialias: false,
          alpha: true,
          stencil: false,
          depth: false,
        }}
        dpr={[1, 2]}
        orthographic
        // camera={{ position: [0, 0, 5000], near: 0.001, far: 10000, zoom: 1 }}
        frameloop="never"
        //   linear
        flat
      >
        <Suspense>
          <OrthographicCamera
            makeDefault
            position={[0, 0, 5000]}
            near={0.001}
            far={10000}
            zoom={1}
          />
          <RAF />
          <PostProcessing />
          <WebGLTunnel.Out />
        </Suspense>
      </Canvas>
      <DOMTunnel.Out />
    </div>
  )
}
