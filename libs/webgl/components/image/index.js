import { useImageTexture } from 'libs/webgl/hooks/use-image-texture'

export function Image({ src, ...props }) {
  const texture = useImageTexture(src)

  return (
    <>
      {texture && (
        <mesh {...props}>
          <planeGeometry />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}
    </>
  )
}
