import { PixelationEffect } from 'postprocessing'
import { useEffect, useState } from 'react'

export function usePixelationEffect(granularity = 20) {
  const [effect] = useState(() => new PixelationEffect(granularity))

  useEffect(() => {
    // const pane = new Pane()
    // const folder = pane.addFolder({
    //   title: 'pixelation',
    // })
    // folder.addInput(effect, 'granularity', {
    //   min: 1,
    //   max: 100,
    //   step: 1,
    // })
    // return () => {
    //   pane.dispose()
    // }
  }, [])

  return effect
}
