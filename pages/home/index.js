import { Layout } from 'layouts/default'
import Shopify from 'libs/shopify'
import s from './home.module.scss'

export default function Home() {
  return (
    <Layout theme="light">
      <section className={s.content}>
        <h1 className={s.title}>satus</h1>
      </section>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const store = new Shopify()
  const productsArray = await store.getAllProducts('active')

  return {
    props: {
      productsArray: productsArray,
    },
    revalidate: 1,
  }
}
