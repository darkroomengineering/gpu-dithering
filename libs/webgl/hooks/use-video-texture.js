import { useEffect, useState } from 'react'
import { DefaultLoadingManager, VideoTexture } from 'three'

export function useVideoTexture(src) {
  const [texture, setTexture] = useState()

  useEffect(() => {
    if (!src) return

    DefaultLoadingManager.itemStart(src)

    const videoElement = document.createElement('video')
    videoElement.src = src
    videoElement.crossOrigin = 'anonymous'
    videoElement.loop = true
    videoElement.muted = true
    videoElement.autoplay = true
    videoElement.playsInline = true
    videoElement.play()

    videoElement.addEventListener(
      'loadedmetadata',
      () => {
        setTexture(new VideoTexture(videoElement))
      },
      {
        once: true,
      },
    )

    return () => {
      texture?.dispose()
      setTexture(undefined)
    }
  }, [src])

  return texture
}
