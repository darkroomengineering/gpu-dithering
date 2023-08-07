import { useObjectFit } from 'hooks/use-object-fit'
import { useVideoTexture } from 'libs/webgl/hooks/use-video-texture'

export function Video({ src, scale = [1, 1, 1], ...props }) {
  const texture = useVideoTexture(src)

  const [x, y] = useObjectFit(
    scale[0],
    scale[1],
    texture?.image?.videoWidth,
    texture?.image?.videoHeight,
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
}
