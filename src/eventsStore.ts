import { create } from 'zustand'
import { DEFAULT_MAX_DESK_COUNTS } from './config'
import { supabase } from './supabaseClient'
import type { Desk, EventRecord } from './types'

// Supabaseの`events`テーブルの行の形（スネークケース）
type EventRow = {
  id: string
  name: string
  date: string
  desks: Desk[] | null
  max_desk_counts: Record<string, number> | null
  share_token: string
  created_at: string
  updated_at: string
}

function fromRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    desks: row.desks ?? [],
    maxDeskCounts: row.max_desk_counts ?? { ...DEFAULT_MAX_DESK_COUNTS },
    shareToken: row.share_token,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

type EventsState = {
  events: EventRecord[]
  loading: boolean
  error: string | null

  loadEvents: () => Promise<void>
  createEvent: (name: string, date: string) => Promise<EventRecord>
  deleteEvent: (id: string) => Promise<void>
  getEventById: (id: string) => Promise<EventRecord | null>
  getEventByShareToken: (token: string) => Promise<EventRecord | null>
  saveEvent: (id: string, desks: Desk[], maxDeskCounts: Record<string, number>) => Promise<void>
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  loading: false,
  error: null,

  loadEvents: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    set({ events: (data ?? []).map(fromRow), loading: false })
  },

  createEvent: async (name, date) => {
    const trimmed = name.trim()
    const insertName = trimmed || `イベント ${new Date().toLocaleString('ja-JP')}`
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: insertName,
        date,
        desks: [],
        max_desk_counts: { ...DEFAULT_MAX_DESK_COUNTS },
      })
      .select()
      .single()
    if (error || !data) {
      throw new Error(error?.message ?? 'イベントの作成に失敗しました')
    }
    const event = fromRow(data)
    set((s) => ({ events: [event, ...s.events] }))
    return event
  },

  deleteEvent: async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw new Error(error.message)
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
  },

  getEventById: async (id) => {
    const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return fromRow(data)
  },

  getEventByShareToken: async (token) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('share_token', token)
      .maybeSingle()
    if (error || !data) return null
    return fromRow(data)
  },

  saveEvent: async (id, desks, maxDeskCounts) => {
    const { error } = await supabase
      .from('events')
      .update({
        desks,
        max_desk_counts: maxDeskCounts,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) throw new Error(error.message)
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id ? { ...e, desks, maxDeskCounts, updatedAt: Date.now() } : e,
      ),
    }))
  },
}))
