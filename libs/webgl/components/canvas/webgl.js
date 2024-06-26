import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useCanvas } from '../../hooks/use-canvas'
import { Content } from '../content'
import { PostProcessing } from '../postprocessing'
import { RAF } from '../raf'
import s from './webgl.module.scss'

export function WebGLCanvas() {
  const { WebGLTunnel, DOMTunnel } = useCanvas()

  return (
    <div className={s.webgl} id="webgl">
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
        frameloop="never"
        linear
        flat
        resize={{}}
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
          <Content />
        </Suspense>
      </Canvas>
      <DOMTunnel.Out />
    </div>
  )
}
