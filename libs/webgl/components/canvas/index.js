import { useDeviceDetection } from 'components/device-detection'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import tunnel from 'tunnel-rat'
import { CanvasContext } from '../../hooks/use-canvas'

const WebGLCanvas = dynamic(
  () => import('./webgl').then(({ WebGLCanvas }) => WebGLCanvas),
  {
    ssr: false,
  },
)

export function Canvas({ children }) {
  const [WebGLTunnel] = useState(new tunnel())
  const [DOMTunnel] = useState(new tunnel())

  const { isWebGL } = useDeviceDetection()

  return (
    <CanvasContext.Provider value={{ WebGLTunnel, DOMTunnel }}>
      {isWebGL && <WebGLCanvas />}
      {children}
    </CanvasContext.Provider>
  )
}
