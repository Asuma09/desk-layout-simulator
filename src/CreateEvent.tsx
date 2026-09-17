import { useState } from 'react'

type CreateEventProps = {
  onCancel: () => void
  onSubmit: (name: string, date: string) => void
}

function todayIso(): string {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60 * 1000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

export default function CreateEvent({ onCancel, onSubmit }: CreateEventProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(todayIso)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), date)
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← ホームに戻る
        </button>
        <h1 className="text-base font-semibold text-slate-800">イベントを作成する</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-5 p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">イベント名</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 〇〇会議"
            required
            autoFocus
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">日付</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            作成する
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
