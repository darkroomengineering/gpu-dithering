import { useFrame } from '@studio-freight/hamo'
import { useEffect, useMemo } from 'react'
import _Stats from 'stats.js'
import s from './stats.module.scss'

export function Stats() {
  const stats = useMemo(() => new _Stats(), [])

  useEffect(() => {
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)
    stats.dom.classList.add(s.stats)

    return () => {
      stats.dom.remove()
    }
  }, [stats])

  useFrame(() => {
    stats.begin()
  }, -Infinity)

  useFrame(() => {
    stats.end()
  }, Infinity)
}
