import { getStoryblokApi, storyblokEditable } from '@storyblok/react'
import { useStoryblok } from 'hooks/use-storyblok'
import { Layout } from 'layouts/default'
import s from './home.module.scss'

export default function Home({ pageData }) {
  const { content: pageContent } = useStoryblok(pageData, {
    resolveRelations: ['headers.header', 'footers.footer'],
  })

  return (
    <Layout theme="light" layout={pageContent}>
      <section className={s.content} {...storyblokEditable(pageContent.hero)}>
        <h1 className={s.title}>{pageContent.hero.title}</h1>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const storyBlokVars = {
    slug: 'cdn/stories/pages/homepage',
    params: {
      version: 'draft',
      resolve_relations: ['headers.header', 'footers.footer'],
    },
  }

  let { data } = await getStoryblokApi().get(
    `${storyBlokVars.slug}`,
    storyBlokVars.params
  )

  return {
    props: {
      id: 'home',
      pageData: data.story,
    },
    revalidate: 30,
  }
}
