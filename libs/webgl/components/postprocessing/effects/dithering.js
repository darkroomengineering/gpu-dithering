// @refresh reset

import { Pane } from 'tweakpane'

import { ORDERED_DITHERERS } from 'libs/webgl/utils/ordered-ditherers'
import { BlendFunction } from 'postprocessing'
import { useEffect, useState } from 'react'
import { CanvasTexture, NearestFilter, Vector2 } from 'three'
import { DitheringEffect } from './effect'

const DEFAULT_PARAMS = {
  // luminanceFilter: { r: 0.299, g: 0.587, b: 0.114 },
  gammaCorrection: 1,
  matrix: 8,
  mode: ORDERED_DITHERERS.BAYER_8x8,
  blending: {
    opacity: 0.35,
    mode: BlendFunction.NORMAL,
  },
}

// const DEFAULT_PARAMS = {
//   luminanceFilter: { r: 0.299, g: 0.587, b: 0.114 },
//   gammaCorrection: 0.6,
//   matrix: 4,
//   blending: {
//     opacity: 0.35,
//     mode: BlendFunction.NORMAL,
//   },
// }

const PARAMS = structuredClone(DEFAULT_PARAMS)

export function useDitheringEffect() {
  const [effect] = useState(() => new DitheringEffect())
  const [mode, setMode] = useState(DEFAULT_PARAMS.mode)

  useEffect(() => {
    const pane = new Pane()
    const ditheringFolder = pane.addFolder({
      title: 'dithering',
    })

    // ditheringFolder
    //   .addInput(PARAMS, 'luminanceFilter', {
    //     color: { type: 'float' },
    //     label: 'luminance filter',
    //   })
    //   .on('change', ({ value }) => {
    //     effect.luminanceFilter = [value.r, value.g, value.b]
    //   })
    // effect.luminanceFilter = [
    //   PARAMS.luminanceFilter.r,
    //   PARAMS.luminanceFilter.g,
    //   PARAMS.luminanceFilter.b,
    // ]

    ditheringFolder
      .addInput(PARAMS, 'gammaCorrection', {
        min: 0,
        step: 0.01,
        max: 2,
        label: 'gamma correction',
      })
      .on('change', ({ value }) => {
        effect.gammaCorrection = value
      })
    effect.gammaCorrection = PARAMS.gammaCorrection

    ditheringFolder
      .addBlade({
        view: 'list',
        label: 'mode',
        options: ORDERED_DITHERERS,
        value: ORDERED_DITHERERS.BAYER_8x8,
      })
      .on('change', ({ value }) => {
        console.log(value)
        setMode(value)
        // effect.matrix = value
      })

    // ditheringFolder
    //   .addInput(PARAMS, 'matrix', {
    //     options: {
    //       'Bayer 4x4': 4,
    //       'Bayer 8x8': 8,
    //     },
    //     label: 'matrix',
    //   })
    //   .on('change', ({ value }) => {
    //     effect.matrix = value
    //   })
    // effect.matrix = PARAMS.matrix

    const blendingFolder = ditheringFolder.addFolder({
      title: 'blending',
      expanded: true,
    })

    blendingFolder
      .addInput(PARAMS.blending, 'opacity', {
        min: 0,
        step: 0.01,
        max: 1,
        label: 'opacity',
      })
      .on('change', ({ value }) => {
        effect.blendMode.setOpacity(value)
      })
    effect.blendMode.setOpacity(PARAMS.blending.opacity)

    blendingFolder
      .addInput(PARAMS.blending, 'mode', {
        label: 'mode',
        options: BlendFunction,
      })
      .on('change', ({ value }) => {
        effect.blendMode.blendFunction = value
      })
    effect.blendMode.blendFunction = PARAMS.blending.mode

    return () => {
      pane.dispose()
    }
  }, [effect])

  useEffect(() => {
    const buffer = document.createElement('canvas')

    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.zIndex = '9999'
    canvas.style.width = '128px'
    canvas.style.height = '128px'
    // canvas.style.background = 'black'

    const context = canvas.getContext('2d')
    const image = context.createImageData(mode.x, mode.y)

    const buffer32 = new Uint32Array(image.data.buffer)

    for (let i = 0; i < buffer32.length; i++) {
      const value = mode.matrix[i] / (mode.max - 0.999)
      // const value = mode.matrix[i] / mode.max
      const color = Math.floor(value * 255)
      buffer32[i] = (255 << 24) | (color << 16) | (color << 8) | color
    }

    buffer.width = mode.x
    buffer.height = mode.y
    buffer.getContext('2d').putImageData(image, 0, 0)

    context.drawImage(buffer, 0, 0, canvas.width, canvas.height)

    const texture = new CanvasTexture(buffer)
    texture.minFilter = texture.magFilter = NearestFilter
    // texture.wrapS = texture.wrapT = RepeatWrapping
    texture.flipY = false
    effect.matrixTexture = texture
    const size = new Vector2(mode.x, mode.y)
    effect.matrixTextureSize = size

    return () => {
      console.log('remove')
      canvas.remove()
    }
  }, [mode])

  return effect
}
