import { useStoryblokState } from '@storyblok/react'
import { useEffect, useState } from 'react'

const convertArrayToObject = (array, key) => {
  const initialValue = {}
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item.content,
    }
  }, initialValue)
}

/* eslint-disable */
const removeKey = (item, key) => {
  return (({ key, ...others }) => ({ ...others }))(item)
}
/* eslint-enable */

export const checkNestedBlock = (story) => {
  if (!story.content) return {}

  if (story.content.body) {
    const remap = story.content.body.map((item) => {
      return {
        component: item.component,
        content: { ...removeKey(item, item.component) },
      }
    })
    return convertArrayToObject(remap, 'component')
  }
  return story.content
}

export function useStoryblok(seedStory, options = {}) {
  const story = useStoryblokState(seedStory, options)
  const [pageContent, setPageContent] = useState(checkNestedBlock(story))

  useEffect(() => {
    if (!story.content) return

    setPageContent(checkNestedBlock(story))
  }, [story])

  return { content: pageContent, id: story.id }
}
