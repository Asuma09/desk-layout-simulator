import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import Home from './Home'
import EventList from './EventList'
import CreateEvent from './CreateEvent'
import OrganizerEditor from './OrganizerEditor'
import { useLayoutStore } from './store'
import { useEventsStore } from './eventsStore'
import type { EventRecord } from './types'

type Screen = 'home' | 'events' | 'create' | 'editor'

function App() {
  const stageRef = useRef<Konva.Stage>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [currentEvent, setCurrentEvent] = useState<EventRecord | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareCopyStatus, setShareCopyStatus] = useState<string | null>(null)
  const [organizerToken] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('share'),
  )

  useEffect(() => {
    if (organizerToken) return
    useEventsStore.getState().loadEvents()
  }, [organizerToken])

  useEffect(() => {
    if (organizerToken) return
    if (screen !== 'editor') return

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
  }, [screen, organizerToken])

  if (organizerToken) {
    return <OrganizerEditor shareToken={organizerToken} />
  }

  const openEvent = (event: EventRecord) => {
    useLayoutStore.getState().hydrate(event.desks, event.maxDeskCounts, event.id)
    setCurrentEvent(event)
    setShareUrl(null)
    setShareCopyStatus(null)
    setScreen('editor')
  }

  const handleSubmitCreateEvent = async (name: string, date: string) => {
    try {
      const event = await useEventsStore.getState().createEvent(name, date)
      openEvent(event)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'イベントの作成に失敗しました')
    }
  }

  const handleBackToHome = async () => {
    try {
      await useLayoutStore.getState().saveToStorage()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '保存に失敗しました')
    }
    setCurrentEvent(null)
    setShareUrl(null)
    setShareCopyStatus(null)
    setScreen('home')
  }

  const handleIssueShareUrl = async () => {
    if (!currentEvent) return
    const url = `${window.location.origin}${window.location.pathname}?share=${currentEvent.shareToken}`
    setShareUrl(url)
    try {
      await navigator.clipboard.writeText(url)
      setShareCopyStatus('URLをコピーしました')
    } catch {
      setShareCopyStatus('コピーに失敗しました。下のURLを手動でコピーしてください')
    }
  }

  if (screen === 'home') {
    return <Home onCreateEvent={() => setScreen('create')} onShowEventList={() => setScreen('events')} />
  }

  if (screen === 'create') {
    return <CreateEvent onCancel={() => setScreen('home')} onSubmit={handleSubmitCreateEvent} />
  }

  if (screen === 'events') {
    return <EventList onBack={() => setScreen('home')} onOpenEvent={openEvent} />
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2">
        <button
          type="button"
          onClick={handleBackToHome}
          className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
        >
          ← ホーム
        </button>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-800">
          {currentEvent?.name || '会議室 机レイアウト シミュレーター'}
        </h1>
        {currentEvent && (
          <button
            type="button"
            onClick={handleIssueShareUrl}
            className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            共有URLを発行する
          </button>
        )}
      </header>
      {shareUrl && (
        <div className="flex flex-col gap-1 border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 sm:flex-row sm:items-center sm:gap-3">
          <span className="shrink-0 font-medium">{shareCopyStatus}</span>
          <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-xs text-slate-700">
            {shareUrl}
          </code>
          <button
            type="button"
            onClick={() => setShareUrl(null)}
            className="shrink-0 self-start text-xs font-medium text-blue-600 hover:underline sm:self-auto"
          >
            閉じる
          </button>
        </div>
      )}
      <Toolbar stageRef={stageRef} />
      <main className="flex-1 overflow-hidden">
        <Canvas stageRef={stageRef} />
      </main>
    </div>
  )
}

export default App
