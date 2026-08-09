// 部屋・机の寸法設定（保守性要件: ここを変更するだけで全体に反映される）
// 実寸は未確定のため、参考画像の比率をそのまま仮値として使用している。
export const ROOM = {
  widthM: 20.0,
  depthM: 7.5,
}

// イベントスペースの外形（メートル、原点は左上）。時計回りの頂点列。
export const ROOM_POLYGON_M: { x: number; y: number }[] = [
  { x: 0, y: 0 },
  { x: ROOM.widthM, y: 0 },
  { x: ROOM.widthM, y: ROOM.depthM },
  { x: 0, y: ROOM.depthM },
]

// 固定什器（スクリーン・受付・カフェ）。すべて移動不可の固定表示。
export type FixedElement = {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
}

export const FIXED_ELEMENTS: FixedElement[] = [
  { id: 'screen', label: 'スクリーン', x: 0, y: -1.5, width: 12.0, height: 1.5 },
  { id: 'reception', label: '受付', x: 12.0, y: 3.5, width: 1.5, height: 4.0 },
  { id: 'cafe', label: 'カフェ', x: 16.5, y: -1.6, width: 3.5, height: 1.6 },
]

// 机の種類（机を追加する際に選択する）
export type DeskType = {
  id: string
  label: string
  widthM: number
  depthM: number
}

export const DESK_TYPES: DeskType[] = [
  { id: 'standard', label: '長机', widthM: 1.5, depthM: 1.0 },
  { id: 'square', label: '3×3', widthM: 1.5, depthM: 1.5 },
]

export const DEFAULT_DESK_TYPE_ID = DESK_TYPES[0].id

export const GRID_STEP_M = 0.5

// 1メートルあたりのピクセル数（キャンバス表示用）
export const PIXELS_PER_METER = 80

export const ROOM_PX = {
  width: ROOM.widthM * PIXELS_PER_METER,
  height: ROOM.depthM * PIXELS_PER_METER,
}

export const ROOM_POLYGON_PX = ROOM_POLYGON_M.map((p) => ({
  x: p.x * PIXELS_PER_METER,
  y: p.y * PIXELS_PER_METER,
}))

export const FIXED_ELEMENTS_PX = FIXED_ELEMENTS.map((el) => ({
  ...el,
  x: el.x * PIXELS_PER_METER,
  y: el.y * PIXELS_PER_METER,
  width: el.width * PIXELS_PER_METER,
  height: el.height * PIXELS_PER_METER,
}))

export const DESK_TYPES_PX = DESK_TYPES.map((t) => ({
  ...t,
  width: t.widthM * PIXELS_PER_METER,
  height: t.depthM * PIXELS_PER_METER,
}))

export function getDeskTypePx(id: string) {
  return DESK_TYPES_PX.find((t) => t.id === id) ?? DESK_TYPES_PX[0]
}

export const GRID_STEP_PX = GRID_STEP_M * PIXELS_PER_METER

// 部屋外形＋固定什器をすべて含む描画範囲（PNG出力の切り抜きに使用）
const boundsXs = [
  ...ROOM_POLYGON_PX.map((p) => p.x),
  ...FIXED_ELEMENTS_PX.flatMap((el) => [el.x, el.x + el.width]),
]
const boundsYs = [
  ...ROOM_POLYGON_PX.map((p) => p.y),
  ...FIXED_ELEMENTS_PX.flatMap((el) => [el.y, el.y + el.height]),
]

export const ROOM_BOUNDS_PX = {
  minX: Math.min(...boundsXs),
  minY: Math.min(...boundsYs),
  maxX: Math.max(...boundsXs),
  maxY: Math.max(...boundsYs),
}

export const STORAGE_KEY = 'desk-layout-simulator:layout'
