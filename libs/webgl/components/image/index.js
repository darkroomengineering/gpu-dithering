import { useObjectFit } from 'hooks/use-object-fit'
import { useImageTexture } from 'libs/webgl/hooks/use-image-texture'

export function Image({ src, scale = [1, 1, 1], ...props }) {
  const texture = useImageTexture(src)

  const [x, y] = useObjectFit(
    scale[0],
    scale[1],
    texture?.image?.width,
    texture?.image?.height,
  )

  return (
    <>
      {texture && (
        <group scale={scale} {...props}>
          <mesh scale={[x, y, 1]}>
            <planeGeometry />
            <meshBasicMaterial map={texture} />
          </mesh>
        </group>
      )}
    </>
  )
}
