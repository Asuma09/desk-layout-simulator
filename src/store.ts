import { create } from 'zustand'
import {
  DEFAULT_DESK_TYPE_ID,
  DEFAULT_MAX_DESK_COUNTS,
  GRID_STEP_PX,
  MAX_DESK_COUNT_LIMIT,
  ROOM_PX,
  STORAGE_KEY,
  getDeskTypePx,
} from './config'

export type Desk = {
  id: string
  x: number
  y: number
  rotation: number
  typeId: string
}

type LayoutState = {
  desks: Desk[]
  selectedId: string | null
  maxDeskCounts: Record<string, number>
  past: Desk[][]
  future: Desk[][]
  dragSnapshot: Desk[] | null

  selectDesk: (id: string | null) => void
  setMaxDeskCount: (typeId: string, count: number) => void
  addDesk: (typeId: string) => boolean
  duplicateSelected: () => boolean
  deleteSelected: () => void
  rotateSelected: () => void
  beginDrag: () => void
  updateDeskPosition: (id: string, x: number, y: number) => void
  updateDeskRotation: (id: string, rotation: number) => void
  endDrag: () => void
  undo: () => void
  redo: () => void
  saveToStorage: () => void
  loadFromStorage: () => boolean
}

function snap(value: number, step: number): number {
  return Math.round(value / step) * step
}

function commit(
  set: (fn: (s: LayoutState) => Partial<LayoutState>) => void,
  desks: Desk[],
) {
  set((s) => ({
    past: [...s.past, s.desks],
    desks,
    future: [],
  }))
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  desks: [],
  selectedId: null,
  maxDeskCounts: { ...DEFAULT_MAX_DESK_COUNTS },
  past: [],
  future: [],
  dragSnapshot: null,

  selectDesk: (id) => set({ selectedId: id }),

  setMaxDeskCount: (typeId, count) => {
    const clamped = Math.min(Math.max(Math.round(count) || 1, 1), MAX_DESK_COUNT_LIMIT)
    set((s) => ({ maxDeskCounts: { ...s.maxDeskCounts, [typeId]: clamped } }))
  },

  addDesk: (typeId) => {
    const { desks, maxDeskCounts } = get()
    const limit = maxDeskCounts[typeId] ?? DEFAULT_MAX_DESK_COUNTS[typeId] ?? MAX_DESK_COUNT_LIMIT
    const countOfType = desks.filter((d) => d.typeId === typeId).length
    if (countOfType >= limit) return false
    const deskPx = getDeskTypePx(typeId)
    const count = desks.length
    const cols = Math.max(1, Math.floor(ROOM_PX.width / (deskPx.width + GRID_STEP_PX)))
    const col = count % cols
    const row = Math.floor(count / cols)
    const margin = GRID_STEP_PX
    const x = snap(margin + deskPx.width / 2 + col * (deskPx.width + GRID_STEP_PX), GRID_STEP_PX)
    const y = snap(margin + deskPx.height / 2 + row * (deskPx.height + GRID_STEP_PX), GRID_STEP_PX)
    const desk: Desk = {
      id: crypto.randomUUID(),
      x,
      y,
      rotation: 0,
      typeId: deskPx.id,
    }
    commit(set, [...desks, desk])
    set({ selectedId: desk.id })
    return true
  },

  duplicateSelected: () => {
    const { desks, selectedId, maxDeskCounts } = get()
    const original = desks.find((d) => d.id === selectedId)
    if (!original) return false
    const limit =
      maxDeskCounts[original.typeId] ??
      DEFAULT_MAX_DESK_COUNTS[original.typeId] ??
      MAX_DESK_COUNT_LIMIT
    const countOfType = desks.filter((d) => d.typeId === original.typeId).length
    if (countOfType >= limit) return false
    const clone: Desk = {
      ...original,
      id: crypto.randomUUID(),
      x: snap(original.x + GRID_STEP_PX, GRID_STEP_PX),
      y: snap(original.y + GRID_STEP_PX, GRID_STEP_PX),
    }
    commit(set, [...desks, clone])
    set({ selectedId: clone.id })
    return true
  },

  deleteSelected: () => {
    const { desks, selectedId } = get()
    if (!selectedId) return
    commit(set, desks.filter((d) => d.id !== selectedId))
    set({ selectedId: null })
  },

  rotateSelected: () => {
    const { desks, selectedId } = get()
    if (!selectedId) return
    commit(
      set,
      desks.map((d) =>
        d.id === selectedId ? { ...d, rotation: (d.rotation + 90) % 360 } : d,
      ),
    )
  },

  beginDrag: () => set((s) => ({ dragSnapshot: s.desks })),

  updateDeskPosition: (id, x, y) => {
    set((s) => ({
      desks: s.desks.map((d) => (d.id === id ? { ...d, x, y } : d)),
    }))
  },

  updateDeskRotation: (id, rotation) => {
    set((s) => ({
      desks: s.desks.map((d) => (d.id === id ? { ...d, rotation } : d)),
    }))
  },

  endDrag: () => {
    const { dragSnapshot } = get()
    if (!dragSnapshot) return
    set((s) => ({
      past: [...s.past, dragSnapshot],
      future: [],
      dragSnapshot: null,
    }))
  },

  undo: () => {
    const { past, desks, future } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      future: [desks, ...future],
      desks: previous,
      selectedId: null,
    })
  },

  redo: () => {
    const { future, desks, past } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      future: future.slice(1),
      past: [...past, desks],
      desks: next,
      selectedId: null,
    })
  },

  saveToStorage: () => {
    const { desks, maxDeskCounts } = get()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ desks, maxDeskCounts }))
  },

  loadFromStorage: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    try {
      type StoredV1 = Desk[]
      type StoredV2 = { desks: Desk[]; maxDeskCount?: number }
      type StoredV3 = { desks: Desk[]; maxDeskCounts?: Record<string, number> }
      const parsed = JSON.parse(raw) as StoredV1 | StoredV2 | StoredV3
      // 旧形式（机の配列のみ／全体上限のみ）と新形式（種類ごとの上限）のすべてに対応
      const rawDesks = Array.isArray(parsed) ? parsed : parsed.desks
      const desks = rawDesks.map((d) => ({ ...d, typeId: d.typeId ?? DEFAULT_DESK_TYPE_ID }))
      let maxDeskCounts = { ...DEFAULT_MAX_DESK_COUNTS }
      if (!Array.isArray(parsed) && parsed && 'maxDeskCounts' in parsed && parsed.maxDeskCounts) {
        maxDeskCounts = { ...maxDeskCounts, ...parsed.maxDeskCounts }
      }
      commit(set, desks)
      set({ selectedId: null, maxDeskCounts })
      return true
    } catch {
      return false
    }
  },
}))
