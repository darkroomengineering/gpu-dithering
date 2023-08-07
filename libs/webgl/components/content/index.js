import { useThree } from '@react-three/fiber'
import { GUI } from 'libs/gui'
import { useCanvas } from 'libs/webgl/hooks/use-canvas'
import { useEffect, useMemo, useState } from 'react'
import Dropzone from 'react-dropzone'
import { Image } from '../image'
import { Video } from '../video'
import s from './content.module.scss'

export function Content() {
  const { DOMTunnel } = useCanvas()

  const [file, setFile] = useState()

  const isVideo = file?.type.includes('video/')
  const isImage = file?.type.includes('image/')

  const src = useMemo(() => {
    return file ? URL.createObjectURL(file) : '/placeholder/3.jpg'
  }, [file])

  const { size, gl } = useThree()

  console.log(file)

  useEffect(() => {
    const button = GUI.addButton({
      title: 'Export',
      label: 'export',
    }).on('click', () => {
      requestAnimationFrame(() => {
        const link = document.createElement('a')
        link.download = 'dithering.png'
        link.href = gl.domElement.toDataURL()
        link.click()
      })
    })

    return () => {
      button.dispose()
    }
  }, [])

  return (
    <>
      <DOMTunnel.In>
        <Dropzone
          onDropAccepted={([file]) => {
            setFile(file)
          }}
          noClick
          multiple={false}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className={s.dropzone}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      </DOMTunnel.In>

      {(isImage || !file) && src && (
        <Image src={src} scale={[size.width, size.height, 0]} alt="" />
      )}

      {isVideo && src && (
        <Video src={src} scale={[size.width, size.height, 0]} />
      )}

      {/* <mesh
        position={[0, -400, 1]}
        scale={[100, 1000, 1]}
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
      </mesh> */}
    </>
  )
}
