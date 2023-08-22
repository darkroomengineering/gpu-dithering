import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { Box3, MeshNormalMaterial, Vector3 } from 'three'
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

  const camera = useThree(({ camera }) => camera)
  const controls = useThree(({ controls }) => controls)
  const viewport = useThree(({ viewport }) => viewport)

  useEffect(() => {
    controls?.reset()
    camera.position.set(0, 0, 5000)
    camera.lookAt(0, 0, 0)
    camera.rotation.set(0, 0, 0)

    return () => {
      controls?.reset()
      camera.position.set(0, 0, 5000)
      camera.lookAt(0, 0, 0)
      camera.rotation.set(0, 0, 0)
    }
  }, [model, controls])

  return (
    <>
      <OrbitControls
        domElement={document.querySelector('#__next')}
        makeDefault
      />

      {model && (
        <group
          {...props}
          ref={(group) => {
            if (!group) return

            const box = new Box3().setFromObject(group)
            const { x, y } = box.getSize(new Vector3())

            const { width, height } = viewport.getCurrentViewport()

            const scaleX = width / x
            const scaleY = height / y

            const scale = Math.min(scaleX, scaleY)

            group.scale.setScalar(scale * 0.9)
          }}
        >
          <primitive object={model} />
        </group>
      )}
    </>
  )
}
