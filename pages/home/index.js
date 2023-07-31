import { Hero } from 'components/hero'
import { Layout } from 'layouts/default'
import { Canvas } from 'libs/webgl/components/canvas'

export default function Home() {
  return (
    <Canvas>
      <Layout theme="light">
        <Hero>satus</Hero>
      </Layout>
    </Canvas>
  )
}

export async function getStaticProps() {
  return {
    props: {
      id: 'home',
    }, // will be passed to the page component as props
  }
}
