import { useEffect, useRef } from 'react'
import type Konva from 'konva'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import { useLayoutStore } from './store'

function App() {
  const stageRef = useRef<Konva.Stage>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return

      const { deleteSelected, undo, redo, duplicateSelected } = useLayoutStore.getState()

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicateSelected()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-2">
        <h1 className="text-base font-semibold text-slate-800">
          会議室 机レイアウト シミュレーター
        </h1>
      </header>
      <Toolbar stageRef={stageRef} />
      <main className="flex-1 overflow-hidden">
        <Canvas stageRef={stageRef} />
      </main>
    </div>
  )
}

export default App
