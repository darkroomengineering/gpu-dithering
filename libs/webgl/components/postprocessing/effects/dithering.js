// @refresh reset

import { Pane } from 'tweakpane'

import { BlendFunction } from 'postprocessing'
import { useEffect, useState } from 'react'
import { DitheringEffect } from './effect'

const DEFAULT_PARAMS = {
  luminanceFilter: { r: 0.2126, g: 0.7152, b: 0.0722 },
  gammaCorrection: 0.6,
  blending: {
    opacity: 0.35,
    mode: BlendFunction.NORMAL,
  },
}

const PARAMS = structuredClone(DEFAULT_PARAMS)

export function useDitheringEffect() {
  const [effect] = useState(() => new DitheringEffect())

  useEffect(() => {
    const pane = new Pane()
    const ditheringFolder = pane.addFolder({
      title: 'dithering',
    })

    ditheringFolder
      .addInput(PARAMS, 'luminanceFilter', {
        color: { type: 'float' },
        label: 'luminance filter',
      })
      .on('change', ({ value }) => {
        effect.luminanceFilter = [value.r, value.g, value.b]
      })
    effect.luminanceFilter = [
      PARAMS.luminanceFilter.r,
      PARAMS.luminanceFilter.g,
      PARAMS.luminanceFilter.b,
    ]

    ditheringFolder
      .addInput(PARAMS, 'gammaCorrection', {
        min: 0,
        step: 0.1,
        max: 5,
        label: 'gamma correction',
      })
      .on('change', ({ value }) => {
        effect.gammaCorrection = value
      })
    effect.gammaCorrection = PARAMS.gammaCorrection

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

  return effect
}
