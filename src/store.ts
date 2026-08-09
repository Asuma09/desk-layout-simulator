import { create } from 'zustand'
import {
  DEFAULT_DESK_TYPE_ID,
  GRID_STEP_PX,
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
  past: Desk[][]
  future: Desk[][]
  dragSnapshot: Desk[] | null

  selectDesk: (id: string | null) => void
  addDesk: (typeId: string) => void
  duplicateSelected: () => void
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
  past: [],
  future: [],
  dragSnapshot: null,

  selectDesk: (id) => set({ selectedId: id }),

  addDesk: (typeId) => {
    const { desks } = get()
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
  },

  duplicateSelected: () => {
    const { desks, selectedId } = get()
    const original = desks.find((d) => d.id === selectedId)
    if (!original) return
    const clone: Desk = {
      ...original,
      id: crypto.randomUUID(),
      x: snap(original.x + GRID_STEP_PX, GRID_STEP_PX),
      y: snap(original.y + GRID_STEP_PX, GRID_STEP_PX),
    }
    commit(set, [...desks, clone])
    set({ selectedId: clone.id })
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
    const { desks } = get()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(desks))
  },

  loadFromStorage: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw) as Desk[]
      const desks = parsed.map((d) => ({ ...d, typeId: d.typeId ?? DEFAULT_DESK_TYPE_ID }))
      commit(set, desks)
      set({ selectedId: null })
      return true
    } catch {
      return false
    }
  },
}))
