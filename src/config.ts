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

// 館内全体のざっくりレイアウト（周辺の部屋・廊下を背景として簡易表示するための外形）。
// 座標系はイベントスペース（ROOM_POLYGON_M）と同一。実寸・配置は未確定のため仮値。
// 机の配置判定には使用しない（表示のみ・当たり判定なし）。
export type SurroundingRoom = {
  id: string
  label: string
  points: { x: number; y: number }[]
}

export const SURROUNDING_ROOMS_M: SurroundingRoom[] = [
  {
    id: 'corridor-left',
    label: '廊下',
    points: [
      { x: -3.0, y: -1.5 },
      { x: 0, y: -1.5 },
      { x: 0, y: ROOM.depthM + 2.0 },
      { x: -3.0, y: ROOM.depthM + 2.0 },
    ],
  },
  {
    id: 'room-right',
    label: '別室',
    points: [
      { x: ROOM.widthM, y: -1.5 },
      { x: ROOM.widthM + 6.0, y: -1.5 },
      { x: ROOM.widthM + 6.0, y: ROOM.depthM + 2.0 },
      { x: ROOM.widthM, y: ROOM.depthM + 2.0 },
    ],
  },
  {
    id: 'corridor-bottom',
    label: '廊下',
    points: [
      { x: -3.0, y: ROOM.depthM + 2.0 },
      { x: ROOM.widthM + 6.0, y: ROOM.depthM + 2.0 },
      { x: ROOM.widthM + 6.0, y: ROOM.depthM + 4.0 },
      { x: -3.0, y: ROOM.depthM + 4.0 },
    ],
  },
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

// コンセントの位置（メートル、点座標）。実際の設置位置が確定したらここを更新する。
export type Outlet = {
  id: string
  label: string
  x: number
  y: number
}

export const OUTLETS_M: Outlet[] = [
  { id: 'outlet-1', label: 'コンセント', x: 0.5, y: 0.2 },
  { id: 'outlet-2', label: 'コンセント', x: 10.0, y: 0.2 },
  { id: 'outlet-3', label: 'コンセント', x: 0.5, y: ROOM.depthM - 0.2 },
  { id: 'outlet-4', label: 'コンセント', x: 19.5, y: ROOM.depthM - 0.2 },
  // 参考画像の黒線マーク箇所（部屋中央やや左の横一列 + 右側のクラスタ）を仮座標化したもの
  // 左の5個：等間隔（1.5m間隔）
  { id: 'outlet-5', label: 'コンセント', x: 2.5, y: 3.8 },
  { id: 'outlet-6', label: 'コンセント', x: 4.0, y: 3.8 },
  { id: 'outlet-7', label: 'コンセント', x: 5.5, y: 3.8 },
  { id: 'outlet-8', label: 'コンセント', x: 7.0, y: 3.8 },
  { id: 'outlet-9', label: 'コンセント', x: 8.5, y: 3.8 },
  // 右側クラスタ 1列目・2列目：各3個
  { id: 'outlet-10', label: 'コンセント', x: 14.5, y: 1.8 },
  { id: 'outlet-11', label: 'コンセント', x: 14.5, y: 4.0 },
  { id: 'outlet-12', label: 'コンセント', x: 14.5, y: 6.2 },
  { id: 'outlet-13', label: 'コンセント', x: 17.0, y: 1.8 },
  { id: 'outlet-14', label: 'コンセント', x: 17.0, y: 4.0 },
  { id: 'outlet-15', label: 'コンセント', x: 17.0, y: 6.2 },
  // 右端の縦4個：一番上（y=1.8）を基準に等間隔（1.5m間隔）
  { id: 'outlet-16', label: 'コンセント', x: 19.5, y: 1.8 },
  { id: 'outlet-17', label: 'コンセント', x: 19.5, y: 3.3 },
  { id: 'outlet-18', label: 'コンセント', x: 19.5, y: 4.8 },
  { id: 'outlet-19', label: 'コンセント', x: 19.5, y: 6.3 },
]

// 机の種類（机を追加する際に選択する）
// defaultMaxCount: この種類の机を配置できる上限のデフォルト値（イベントごとにツールバーから変更可能）
export type DeskType = {
  id: string
  label: string
  widthM: number
  depthM: number
  defaultMaxCount: number
}

export const DESK_TYPES: DeskType[] = [
  { id: 'standard', label: '長机', widthM: 1.5, depthM: 1.0, defaultMaxCount: 12 },
  { id: 'square', label: '3×3', widthM: 1.5, depthM: 1.5, defaultMaxCount: 8 },
]

export const DEFAULT_DESK_TYPE_ID = DESK_TYPES[0].id

// 種類ごとの机の最大配置数のデフォルト値（机の種類IDをキーとする）
export const DEFAULT_MAX_DESK_COUNTS: Record<string, number> = Object.fromEntries(
  DESK_TYPES.map((t) => [t.id, t.defaultMaxCount]),
)

// 上限設定欄で入力できる絶対的な上限（誤操作による極端な値の入力を防ぐためのガード）
export const MAX_DESK_COUNT_LIMIT = 300

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

export const SURROUNDING_ROOMS_PX = SURROUNDING_ROOMS_M.map((room) => ({
  ...room,
  points: room.points.map((p) => ({ x: p.x * PIXELS_PER_METER, y: p.y * PIXELS_PER_METER })),
}))

export const OUTLETS_PX = OUTLETS_M.map((o) => ({
  ...o,
  x: o.x * PIXELS_PER_METER,
  y: o.y * PIXELS_PER_METER,
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

// 部屋外形＋固定什器をすべて含む描画範囲（PNG出力の切り抜き・初期フィット表示に使用）。
// 周辺の部屋・廊下（SURROUNDING_ROOMS_PX）はあくまで背景の参考情報のため、
// この範囲には含めない（含めるとメインの部屋が初期表示で小さくなりすぎるため）。
// ズーム・パン操作で確認できる。
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
