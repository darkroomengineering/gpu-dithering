import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

console.log('webgl.js')

export function WebGL() {
  const meshRef = useRef()

  useFrame((_, deltaTime) => {
    meshRef.current.rotation.x += deltaTime
    meshRef.current.rotation.y += deltaTime
  })

  return (
    <mesh scale={100} ref={meshRef}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  )
}
