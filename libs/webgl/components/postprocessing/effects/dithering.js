// @refresh reset

import { useState } from 'react'
import { DitheringEffect } from './effect'

export function useDitheringEffect() {
  const [effect] = useState(() => new DitheringEffect())

  return effect
}
