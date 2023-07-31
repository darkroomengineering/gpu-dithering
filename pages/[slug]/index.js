import { getStoryblokApi, storyblokEditable } from '@storyblok/react'
import { useStoryblok } from 'hooks/use-storyblok'
import { Layout } from 'layouts/default'
import s from './dynamic.module.scss'

export default function DynamicPage({ pageData }) {
  const { content: pageContent } = useStoryblok(pageData, {
    resolveRelations: ['headers.header', 'footers.footer'],
  })

  return (
    <Layout theme="light" layout={pageContent}>
      <section {...storyblokEditable(pageContent.hero)} className={s.title}>
        <h1>{pageContent.hero.title}</h1>
      </section>
    </Layout>
  )
}

// Filter to get the slug paths, change it accordingly your storyblok structure.
// In this case we have two nested folders pages & dynamic
// then pages/dynamic/[slug]
const pathSelector = 'pages/dynamic'

export async function getStaticPaths() {
  const storyblokApi = getStoryblokApi()
  let { data } = await storyblokApi.get('cdn/stories', {
    version: 'draft',
  })

  let paths = []
  data.stories
    .filter((story) => story.full_slug.includes(pathSelector))
    .forEach(({ slug }) => paths.push({ params: { slug } }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  let pageData = {}
  let notFound = false
  const id = `${pathSelector}/${params.slug}`

  const storyBlokVars = {
    slug: `cdn/stories/${id}`,
    params: {
      version: 'draft',
      resolve_relations: ['headers.header', 'footers.footer'],
    },
  }

  // try catch block to handle 404 errors
  try {
    const { data } = await getStoryblokApi().get(
      `${storyBlokVars.slug}`,
      storyBlokVars.params
    )

    pageData = data.story
  } catch (error) {
    console.log('Storyblok error resource not found: ', error)
    notFound = true
  }

  return {
    notFound,
    props: {
      id,
      pageData,
    },
  }
}
