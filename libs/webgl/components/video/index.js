import { useObjectFit } from 'hooks/use-object-fit'
import { useVideoTexture } from 'libs/webgl/hooks/use-video-texture'
import { forwardRef } from 'react'

export const Video = forwardRef(function Video(
  { src, scale = [1, 1, 1], ...props },
  ref,
) {
  const texture = useVideoTexture(src)

  const [x, y] = useObjectFit(
    scale[0],
    scale[1],
    texture?.image?.videoWidth,
    texture?.image?.videoHeight,
  )

  useImperativeHandle(
    ref,
    () => ({
      size: {
        width: texture?.image?.width,
        height: texture?.image?.height,
      },
    }),
    [texture],
  )

  return (
    <>
      {texture && (
        <group scale={scale} {...props}>
          <mesh scale={[x, y, 1]} {...props}>
            <planeGeometry />
            <meshBasicMaterial map={texture} />
          </mesh>
        </group>
      )}
    </>
  )
})
