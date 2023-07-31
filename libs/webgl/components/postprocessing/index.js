import { useFrame, useThree } from '@react-three/fiber'
import { useWindowSize } from '@studio-freight/hamo'
import { EffectComposer, RenderPass } from 'postprocessing'
import { useEffect, useMemo } from 'react'
import { HalfFloatType } from 'three'

export function PostProcessing() {
  const { gl, viewport, camera, scene } = useThree()

  const isWebgl2 = gl.capabilities.isWebGL2
  const dpr = viewport.dpr
  const maxSamples = gl.capabilities.maxSamples
  const needsAA = dpr < 2

  const composer = useMemo(
    () =>
      new EffectComposer(gl, {
        multisampling: isWebgl2 && needsAA ? maxSamples : 0,
        frameBufferType: HalfFloatType,
      }),
    [gl, needsAA, isWebgl2, maxSamples],
  )

  const renderPass = useMemo(
    () => new RenderPass(scene, camera),
    [scene, camera],
  )

  useEffect(() => {
    composer.addPass(renderPass)

    return () => {
      composer.removePass(renderPass)
    }
  }, [composer, renderPass])

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  useEffect(() => {
    const width = Math.min(windowWidth, 2048)
    const height = Math.min(windowHeight, 2048)

    composer.setSize(width, height)
  }, [composer, windowWidth, windowHeight])

  useFrame((_, deltaTime) => {
    composer.render(deltaTime)
  }, 1)
}
