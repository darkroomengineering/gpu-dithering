import DEFAULT_CONFIG from 'config/gui_config.json'
import { Pane } from 'tweakpane'

// let defaultConfig

export const GUI = new Pane()

const folder = GUI.addFolder({ title: 'config' })

folder.addButton({ title: 'import' }).on('click', () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = () => {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      const state = JSON.parse(reader.result)
      console.log(state)
      GUI.importState(state)
    }
    reader.readAsText(file)
  }
  input.click()
})

folder.addButton({ title: 'export' }).on('click', () => {
  const state = GUI.exportState()

  const link = document.createElement('a')
  link.download = 'config.json'
  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(state)], { type: 'application/json' }),
  )
  link.click()
})

folder.addButton({ title: 'reset' }).on('click', () => {
  // localStorage.removeItem('gpu-dithering-config')

  // if (!defaultConfig) return
  // GUI.importState(JSON.parse(defaultConfig))
  // localStorage.setItem('config', JSON.stringify(defaultConfig))

  GUI.importState(DEFAULT_CONFIG)
})

setTimeout(() => {
  GUI.importState(DEFAULT_CONFIG)

  // persist config
  // defaultConfig = JSON.stringify(GUI.exportState())
  // GUI.importState(JSON.parse(localStorage.getItem('config')) || {})

  GUI.on('change', () => {
    localStorage.setItem(
      'gpu-dithering-config',
      JSON.stringify(GUI.exportState()),
    )
  })
}, 1000)
