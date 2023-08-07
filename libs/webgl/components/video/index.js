import { useVideoTexture } from 'libs/webgl/hooks/use-video-texture'

export function Video({ src, ...props }) {
  const texture = useVideoTexture(src)

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
