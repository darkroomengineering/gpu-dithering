import { useCanvas } from 'libs/webgl/hooks/use-canvas'
import dynamic from 'next/dynamic'
import s from './hero.module.scss'

const WebGL = dynamic(
  () => import('../../components/hero/webgl').then(({ WebGL }) => WebGL),
  {
    ssr: false,
  },
)

export function Hero({ children }) {
  const { WebGLTunnel } = useCanvas()

  return (
    <>
      <WebGLTunnel.In>
        <WebGL />
      </WebGLTunnel.In>
      <section className={s.hero}>
        <h1>{children}</h1>
      </section>
    </>
  )
}
