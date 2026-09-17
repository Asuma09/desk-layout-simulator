import { useEffect, useState } from 'react'
import { useEventsStore } from './eventsStore'
import type { EventRecord } from './types'

type EventListProps = {
  onBack: () => void
  onOpenEvent: (event: EventRecord) => void
}

export default function EventList({ onBack, onOpenEvent }: EventListProps) {
  const events = useEventsStore((s) => s.events)
  const loading = useEventsStore((s) => s.loading)
  const error = useEventsStore((s) => s.error)
  const loadEvents = useEventsStore((s) => s.loadEvents)
  const deleteEvent = useEventsStore((s) => s.deleteEvent)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleDelete = async (event: EventRecord) => {
    if (!window.confirm(`「${event.name}」を削除しますか？`)) return
    setDeletingId(event.id)
    try {
      await deleteEvent(event.id)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  const sortedEvents = [...events].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← ホームに戻る
        </button>
        <h1 className="text-base font-semibold text-slate-800">イベント一覧</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <p className="mx-auto mb-3 max-w-2xl rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {loading && events.length === 0 ? (
          <p className="text-sm text-slate-500">読み込み中...</p>
        ) : sortedEvents.length === 0 ? (
          <p className="text-sm text-slate-500">
            イベントがまだありません。「イベントを作成する」から作成してください。
          </p>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-2">
            {sortedEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onOpenEvent(event)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-slate-800">{event.name}</div>
                  <div className="text-xs text-slate-500">
                    {event.date ? `開催日: ${event.date} ・ ` : ''}
                    机 {event.desks.length}台 ・ 更新: {new Date(event.updatedAt).toLocaleString('ja-JP')}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(event)}
                  disabled={deletingId === event.id}
                  className="shrink-0 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deletingId === event.id ? '削除中...' : '削除'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
