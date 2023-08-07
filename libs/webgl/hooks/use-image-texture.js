import { useEffect, useState } from 'react'
import { DefaultLoadingManager, TextureLoader } from 'three'

const loader = new TextureLoader()

export function useImageTexture(src) {
  //   const texture = suspend(
  //     () =>
  //       new Promise((res) => {
  //         if (!src) return res(null)

  //         DefaultLoadingManager.itemStart(src)

  //         loader.load(src, (texture) => {
  //           res(texture)

  //           DefaultLoadingManager.itemEnd(src)
  //         })
  //       }),
  //     [src],
  //     )

  const [texture, setTexture] = useState()

  useEffect(() => {
    if (!src) return

    DefaultLoadingManager.itemStart(src)

    loader.load(src, (texture) => {
      setTexture(texture)

      DefaultLoadingManager.itemEnd(src)
    })

    return () => {
      texture?.dispose()
      setTexture(undefined)
    }
  }, [src])

  return texture
}
