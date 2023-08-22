import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { MeshNormalMaterial } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
loader.setDRACOLoader(dracoLoader)
const material = new MeshNormalMaterial()

export function Model({ src, ...props }) {
  const [model, setModel] = useState()

  useEffect(() => {
    loader.load(src, ({ scene }) => {
      setModel(scene)
    })
  }, [src])

  useEffect(() => {
    model?.traverse((child) => {
      if (child.isMesh) {
        child.material = material
      }
    })
  }, [model])

  const camera = useThree((state) => state.camera)

  useEffect(() => {
    camera.position.set(0, 0, 5000)
    camera.lookAt(0, 0, 0)
    camera.rotation.set(0, 0, 0)

    return () => {
      camera.position.set(0, 0, 5000)
      camera.lookAt(0, 0, 0)
      camera.rotation.set(0, 0, 0)
    }
  }, [])

  return (
    <>
      <OrbitControls domElement={document.querySelector('#__next')} />
      <group {...props}>{model && <primitive object={model} />}</group>
    </>
  )
}
