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

  return (
    <CanvasContext.Provider value={{ WebGLTunnel, DOMTunnel }}>
      {children}
      <WebGLCanvas />
    </CanvasContext.Provider>
  )
}
