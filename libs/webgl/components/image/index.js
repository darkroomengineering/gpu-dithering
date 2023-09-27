import { useObjectFit } from 'hooks/use-object-fit'
import { useImageTexture } from 'libs/webgl/hooks/use-image-texture'
import { forwardRef, useImperativeHandle } from 'react'

export const Image = forwardRef(function Image(
  { src, scale = [1, 1, 1], ...props },
  ref,
) {
  const texture = useImageTexture(src)

  const [x, y] = useObjectFit(
    scale[0],
    scale[1],
    texture?.image?.width,
    texture?.image?.height,
    'contain',
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

  // const setSize = useThree((state) => state.setSize)

  // useEffect(() => {
  //   if (texture) {
  //     setSize(texture.image.width, texture.image.height)
  //   }
  // }, [texture])

  // console.log(texture?.image?.width, texture?.image?.height)

  return (
    <>
      {texture && (
        <group scale={scale} {...props}>
          <mesh
            scale={[x, y, 1]}
            // scale={[texture?.image?.width, texture?.image?.height, 1]}
          >
            <planeGeometry />
            <meshBasicMaterial map={texture} />
          </mesh>
        </group>
      )}
    </>
  )
})
