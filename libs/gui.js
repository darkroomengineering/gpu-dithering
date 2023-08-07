import { Pane } from 'tweakpane'

let defaultConfig

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
      GUI.importState(JSON.parse(reader.result))
    }
    reader.readAsText(file)
  }
  input.click()
})

folder.addButton({ title: 'export' }).on('click', () => {
  const state = GUI.exportState()
  console.log(state)

  const link = document.createElement('a')
  link.download = 'config.json'
  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(state)], { type: 'application/json' }),
  )
  link.click()
})

folder.addButton({ title: 'reset' }).on('click', () => {
  GUI.importState(defaultConfig)
  localStorage.setItem('config', JSON.stringify(defaultConfig))
})

setTimeout(() => {
  // persist config
  defaultConfig = GUI.exportState()
  GUI.importState(JSON.parse(localStorage.getItem('config')) || {})

  GUI.on('change', () => {
    localStorage.setItem('config', JSON.stringify(GUI.exportState()))
  })
}, 1000)
