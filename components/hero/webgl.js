import { GradientTexture, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

console.log('webgl.js')

export function WebGL() {
  const meshRef = useRef()
  const groupRef = useRef()

  useFrame((gl, deltaTime) => {
    // const time = gl.clock.getElapsedTime()

    // meshRef.current.position.y = Math.sin(time) * 100
    meshRef.current.rotation.x += deltaTime
    meshRef.current.rotation.y += deltaTime

    // groupRef.current.rotation.z += deltaTime
    // groupRef.current.position.y = Math.sin(time) * 100
  })

  const texture1 = useTexture('/placeholder/1.jpg')
  // const texture1sd = useTexture('/placeholder/1.avif')
  const texture2 = useTexture('/placeholder/2.jpg')
  const texture3 = useTexture('/placeholder/3.jpg')
  const text = useTexture('/placeholder/text.png')

  return (
    <>
      <group ref={groupRef}>
        <mesh
          position={[0, -350, 1]}
          scale={[200, 1000, 1]}
          rotation={[0, 0, -Math.PI / 2]}
        >
          <planeGeometry />
          <meshBasicMaterial>
            <GradientTexture
              stops={[0, 0.05, 0.95, 1]} // As many stops as you want
              colors={['white', 'white', 'black', 'black']} // Colors need to match the number of stops
              size={1024} // Size is optional, default = 1024
            />
          </meshBasicMaterial>
        </mesh>
        <mesh position={[-300, 200, 0]} scale={400}>
          <planeGeometry />
          <meshBasicMaterial map={texture1} />
        </mesh>
        <mesh position={[-300, -200, 0]} scale={400}>
          <planeGeometry />
          <meshBasicMaterial map={text} transparent />
        </mesh>
        <mesh position={[300, 0, 0]} scale={400}>
          <planeGeometry />
          <meshBasicMaterial map={texture2} />
        </mesh>
        <mesh position={[0, 300, 0]} scale={400}>
          <planeGeometry />
          <meshBasicMaterial map={texture3} />
        </mesh>
        <mesh scale={100} ref={meshRef}>
          <boxGeometry />
          <meshNormalMaterial />
        </mesh>
      </group>
    </>
  )
}
