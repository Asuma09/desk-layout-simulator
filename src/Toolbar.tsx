import { useState } from 'react'
import type Konva from 'konva'
import {
  DEFAULT_DESK_TYPE_ID,
  DESK_TYPES,
  MAX_DESK_COUNT_LIMIT,
  ROOM_BOUNDS_PX,
} from './config'
import { useLayoutStore } from './store'

function exportPng(stageRef: React.RefObject<Konva.Stage | null>) {
  const stage = stageRef.current
  if (!stage) return
  const padding = 24
  const prev = {
    width: stage.width(),
    height: stage.height(),
    scaleX: stage.scaleX(),
    scaleY: stage.scaleY(),
    x: stage.x(),
    y: stage.y(),
  }

  stage.width(ROOM_BOUNDS_PX.maxX - ROOM_BOUNDS_PX.minX + padding * 2)
  stage.height(ROOM_BOUNDS_PX.maxY - ROOM_BOUNDS_PX.minY + padding * 2)
  stage.scale({ x: 1, y: 1 })
  stage.position({
    x: padding - ROOM_BOUNDS_PX.minX,
    y: padding - ROOM_BOUNDS_PX.minY,
  })
  stage.batchDraw()

  const uri = stage.toDataURL({ pixelRatio: 2 })

  stage.width(prev.width)
  stage.height(prev.height)
  stage.scale({ x: prev.scaleX, y: prev.scaleY })
  stage.position({ x: prev.x, y: prev.y })
  stage.batchDraw()

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const link = document.createElement('a')
  link.download = `desk-layout-${timestamp}.png`
  link.href = uri
  link.click()
}

function ToolbarButton({
  onClick,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:py-1.5"
    >
      {children}
    </button>
  )
}

type ToolbarProps = {
  stageRef: React.RefObject<Konva.Stage | null>
}

export default function Toolbar({ stageRef }: ToolbarProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [deskTypeId, setDeskTypeId] = useState(DEFAULT_DESK_TYPE_ID)

  const desks = useLayoutStore((s) => s.desks)
  const maxDeskCounts = useLayoutStore((s) => s.maxDeskCounts)
  const selectedId = useLayoutStore((s) => s.selectedId)
  const canUndo = useLayoutStore((s) => s.past.length > 0)
  const canRedo = useLayoutStore((s) => s.future.length > 0)

  const setMaxDeskCount = useLayoutStore((s) => s.setMaxDeskCount)
  const addDesk = useLayoutStore((s) => s.addDesk)
  const duplicateSelected = useLayoutStore((s) => s.duplicateSelected)
  const deleteSelected = useLayoutStore((s) => s.deleteSelected)
  const rotateSelected = useLayoutStore((s) => s.rotateSelected)
  const undo = useLayoutStore((s) => s.undo)
  const redo = useLayoutStore((s) => s.redo)
  const saveToStorage = useLayoutStore((s) => s.saveToStorage)
  const loadFromStorage = useLayoutStore((s) => s.loadFromStorage)

  const flash = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2000)
  }

  const deskTypeStats = DESK_TYPES.map((t) => {
    const count = desks.filter((d) => d.typeId === t.id).length
    const max = maxDeskCounts[t.id] ?? t.defaultMaxCount
    return { ...t, count, max }
  })

  const selectedDesk = desks.find((d) => d.id === selectedId)
  const selectedTypeStats = deskTypeStats.find((t) => t.id === selectedDesk?.typeId)
  const activeTypeStats = deskTypeStats.find((t) => t.id === deskTypeId)

  const atMaxForActiveType = activeTypeStats ? activeTypeStats.count >= activeTypeStats.max : false
  const atMaxForSelected = selectedTypeStats ? selectedTypeStats.count >= selectedTypeStats.max : false

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 sm:flex-wrap sm:overflow-visible sm:px-4 sm:py-3">
        <select
          value={deskTypeId}
          onChange={(e) => setDeskTypeId(e.target.value)}
          title="机の種類"
          className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-700 shadow-sm sm:py-1.5"
        >
          {DESK_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <ToolbarButton
          onClick={() => {
            if (!addDesk(deskTypeId)) {
              flash(`${activeTypeStats?.label ?? ''}の上限（${activeTypeStats?.max ?? 0}台）に達しています`)
            }
          }}
          disabled={atMaxForActiveType}
          title={
            atMaxForActiveType
              ? `${activeTypeStats?.label ?? ''}の上限（${activeTypeStats?.max ?? 0}台）に達しています`
              : '机を追加'
          }
        >
          + 机を追加
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            if (!duplicateSelected()) {
              flash(`${selectedTypeStats?.label ?? ''}の上限（${selectedTypeStats?.max ?? 0}台）に達しています`)
            }
          }}
          disabled={!selectedId || atMaxForSelected}
          title="Ctrl+D"
        >
          複製
        </ToolbarButton>
        <ToolbarButton onClick={rotateSelected} disabled={!selectedId} title="90度回転">
          回転
        </ToolbarButton>
        <ToolbarButton onClick={deleteSelected} disabled={!selectedId} title="Delete">
          削除
        </ToolbarButton>

        <span className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

        {deskTypeStats.map((t) => (
          <label
            key={t.id}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-700"
          >
            {t.label}上限
            <input
              type="number"
              min={1}
              max={MAX_DESK_COUNT_LIMIT}
              value={t.max}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (Number.isFinite(value)) setMaxDeskCount(t.id, value)
              }}
              title={`${t.label}の最大配置数（イベントごとに設定可能）`}
              className="w-16 shrink-0 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 shadow-sm sm:py-1.5"
            />
            台
          </label>
        ))}

        <span className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

        <ToolbarButton onClick={undo} disabled={!canUndo} title="Ctrl+Z">
          元に戻す
        </ToolbarButton>
        <ToolbarButton onClick={redo} disabled={!canRedo} title="Ctrl+Shift+Z">
          やり直し
        </ToolbarButton>

        <span className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

        <ToolbarButton onClick={() => exportPng(stageRef)} title="PNG画像として保存">
          画像出力
        </ToolbarButton>
        <ToolbarButton
          title="レイアウトを保存"
          onClick={() => {
            saveToStorage()
            flash('保存しました')
          }}
        >
          保存
        </ToolbarButton>
        <ToolbarButton
          title="レイアウトを読込"
          onClick={() => {
            const ok = loadFromStorage()
            flash(ok ? '読み込みました' : '保存データがありません')
          }}
        >
          読込
        </ToolbarButton>

        <span className="ml-auto hidden shrink-0 items-center gap-3 text-sm text-slate-600 sm:flex">
          {message && <span className="text-emerald-600">{message}</span>}
          <span className="font-medium text-slate-800">
            {deskTypeStats.map((t) => `${t.label} ${t.count}/${t.max}`).join('　')} 台
          </span>
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-1.5 text-sm text-slate-600 sm:hidden">
        <span className="text-emerald-600">{message}</span>
        <span className="ml-auto font-medium text-slate-800">
          {deskTypeStats.map((t) => `${t.label} ${t.count}/${t.max}`).join('　')} 台
        </span>
      </div>
    </div>
  )
}
