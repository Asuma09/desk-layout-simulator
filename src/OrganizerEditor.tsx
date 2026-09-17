import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import { useLayoutStore } from './store'
import { useEventsStore } from './eventsStore'
import type { EventRecord } from './types'

// イベント主催者に共有URL（?share=トークン）経由で渡す、机レイアウト編集専用の画面。
// ホーム画面やイベント一覧・イベント作成など管理者向けの機能へは遷移できない。
type OrganizerEditorProps = {
  shareToken: string
}

type Status = 'loading' | 'ready' | 'not-found'

export default function OrganizerEditor({ shareToken }: OrganizerEditorProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [event, setEvent] = useState<EventRecord | null>(null)

  useEffect(() => {
    let cancelled = false
    useEventsStore
      .getState()
      .getEventByShareToken(shareToken)
      .then((found) => {
        if (cancelled) return
        if (!found) {
          setStatus('not-found')
          return
        }
        useLayoutStore.getState().hydrate(found.desks, found.maxDeskCounts, found.id)
        setEvent(found)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('not-found')
      })
    return () => {
      cancelled = true
    }
  }, [shareToken])

  useEffect(() => {
    if (status !== 'ready') return

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
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">読み込み中...</p>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-center text-sm text-slate-500">
          このURLは無効です。イベント管理者に共有URLを確認してください。
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-2">
        <h1 className="truncate text-base font-semibold text-slate-800">
          {event?.name} の机レイアウト編集
        </h1>
      </header>
      <Toolbar stageRef={stageRef} />
      <main className="flex-1 overflow-hidden">
        <Canvas stageRef={stageRef} />
      </main>
    </div>
  )
}
