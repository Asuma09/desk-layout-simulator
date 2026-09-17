type HomeProps = {
  onCreateEvent: () => void
  onShowEventList: () => void
}

export default function Home({ onCreateEvent, onShowEventList }: HomeProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">会議室 机レイアウト シミュレーター</h1>
        <p className="mt-2 text-sm text-slate-500">
          イベントを作成して机の配置をシミュレーションできます
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onCreateEvent}
          className="rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          イベントを作成する
        </button>
        <button
          type="button"
          onClick={onShowEventList}
          className="rounded-lg border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          イベント一覧
        </button>
      </div>
    </div>
  )
}
