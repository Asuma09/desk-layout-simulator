export type Desk = {
  id: string
  x: number
  y: number
  rotation: number
  typeId: string
}

// イベント一覧機能用: 1イベント分のレイアウトデータ
export type EventRecord = {
  id: string
  name: string
  // イベント開催日（YYYY-MM-DD形式）。作成フォームで入力する。
  date: string
  createdAt: number
  updatedAt: number
  desks: Desk[]
  maxDeskCounts: Record<string, number>
  // イベント主催者に渡す共有URL（レイアウト編集用）の識別トークン
  shareToken: string
}
