import { createContext, useContext } from 'react'

export const CanvasContext = createContext({})

export function useCanvas() {
  return useContext(CanvasContext)
}
