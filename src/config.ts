// 部屋・机の寸法設定（保守性要件: ここを変更するだけで全体に反映される）
// メインのイベントスペースは実測済み（ヒトマス50cm基準、モニター前 横15マス×縦12マス = 7.5m × 6.0m）。
// 周辺エリア（UNICES・別室の高さ方向・eスタジアム・söt・スクリーン・カフェ・コンセント位置）は
// まだ実測できていないため、旧仮値（20.0m×7.5mの部屋を基準にした比率）を保ったまま
// 新しい実測サイズに合わせて縮小した仮値を使用している。実測が済み次第、該当箇所を更新すること。
// 別室の幅・受付の位置と寸法は実測済み。
export const ROOM = {
  widthM: 7.5,
  depthM: 6.0,
}

// 旧仮の部屋サイズ（20.0m×7.5m）に対する縮小比率。未実測の周辺要素の座標・寸法を
// 実測後のROOMサイズに揃えて縮小するために使用する。
const LEGACY_SCALE_X = ROOM.widthM / 20.0
const LEGACY_SCALE_Y = ROOM.depthM / 7.5

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

// UNICES（左の廊下）とeスタジアムの左端は同じx座標で揃える。未実測のため仮値。
const LEFT_AREA_LEFT_X = -1.75
// UNICES（左の廊下）の幅。eスタジアムの左端と揃えた値（未実測のため仮値）。
const LEFT_CORRIDOR_WIDTH_M = -LEFT_AREA_LEFT_X
// 別室の幅。実測済み（ヒトマス50cm×13マス = 6.5m）。
const RIGHT_AREA_WIDTH_M = 6.5

// eスタジアムの奥まった部分・sötの上辺は同じ高さ（y座標）で揃える。未実測のため仮値。
const SOT_TOP_Y = ROOM.depthM + 1.3

// eスタジアムの外形。手描きで指示された形（UNICES側はメインルーム下端に接し、
// メインルーム側はsötの上辺と同じ高さまで奥まったL字形）をおおよそ座標化した仮の多角形。
// 左端はUNICESと揃えている。未実測。
const E_STADIUM_POINTS: { x: number; y: number }[] = [
  { x: LEFT_AREA_LEFT_X, y: ROOM.depthM },
  { x: 0, y: ROOM.depthM },
  { x: 0, y: SOT_TOP_Y },
  { x: 3.25, y: SOT_TOP_Y },
  { x: 3.25, y: ROOM.depthM + 3.25 },
  { x: LEFT_AREA_LEFT_X, y: ROOM.depthM + 3.25 },
]

// sötの外形。手描きで指示された形（メインルーム下端から少し離れた長方形）をおおよそ座標化した仮の多角形。未実測。
const SOT_POINTS: { x: number; y: number }[] = [
  { x: 6.3, y: SOT_TOP_Y },
  { x: 14.9, y: SOT_TOP_Y },
  { x: 14.9, y: ROOM.depthM + 4.0 },
  { x: 6.3, y: ROOM.depthM + 4.0 },
]

// サイネージの中央配置に使用する、sötの外接矩形。
const SOT_BOUNDS = {
  minX: Math.min(...SOT_POINTS.map((p) => p.x)),
  maxX: Math.max(...SOT_POINTS.map((p) => p.x)),
  minY: Math.min(...SOT_POINTS.map((p) => p.y)),
  maxY: Math.max(...SOT_POINTS.map((p) => p.y)),
}

export const SURROUNDING_ROOMS_M: SurroundingRoom[] = [
  {
    id: 'room-left',
    label: 'UNICES',
    // 縦（高さ）はメインルーム（白）と同じ、横（幅）は元の廊下と同じ幅（未実測・仮値を縮小）
    points: [
      { x: -LEFT_CORRIDOR_WIDTH_M, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: ROOM.depthM },
      { x: -LEFT_CORRIDOR_WIDTH_M, y: ROOM.depthM },
    ],
  },
  {
    // 下端はメインルームと揃え、下に伸びたsöt空間と重ならないようにしている
    // 幅は実測（6.5m）、上方向の張り出し量は未実測のため旧仮値を縮小
    id: 'room-right',
    label: '別室',
    points: [
      { x: ROOM.widthM, y: -1.5 * LEGACY_SCALE_Y },
      { x: ROOM.widthM + RIGHT_AREA_WIDTH_M, y: -1.5 * LEGACY_SCALE_Y },
      { x: ROOM.widthM + RIGHT_AREA_WIDTH_M, y: ROOM.depthM },
      { x: ROOM.widthM, y: ROOM.depthM },
    ],
  },
  {
    // 「eスタジアム」空間。手描きで指示されたL字形（E_STADIUM_POINTS参照）。未実測のため仮値。
    id: 'e-stadium',
    label: 'eスタジアム',
    points: E_STADIUM_POINTS,
  },
  {
    // 「söt」空間。手描きで指示された形（SOT_POINTS参照）。未実測のため仮値。
    id: 'sot',
    label: 'söt',
    points: SOT_POINTS,
  },
]

// 固定什器（スクリーン・受付・カフェ・サイネージ）。すべて移動不可の固定表示。
export type FixedElement = {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
}

// サイネージの寸法（未実測のため旧仮値を縮小）
const SIGNAGE_WIDTH_M = 1.2 * LEGACY_SCALE_X
const SIGNAGE_HEIGHT_M = 0.4 * LEGACY_SCALE_Y

export const FIXED_ELEMENTS: FixedElement[] = [
  // スクリーン: 未実測のため旧仮値（幅12.0m×高さ1.5m、20m幅の部屋基準）を縮小
  {
    id: 'screen',
    label: 'スクリーン',
    x: 0,
    y: -1.5 * LEGACY_SCALE_Y,
    width: 12.0 * LEGACY_SCALE_X,
    height: 1.5 * LEGACY_SCALE_Y,
  },
  // 受付: 実測済み（250cm×200cm）。設置向きは-90度回転が正しいため、
  // 平面上の footprint は幅2.0m×奥行2.5m（縦長）として扱う。別室内の左下（各辺から0.25mの余白）に配置。
  { id: 'reception', label: '受付', x: ROOM.widthM + 0.25, y: ROOM.depthM - 2.5 - 0.25, width: 2.0, height: 2.5 },
  // söt空間の中央に配置（サイネージ自体の寸法は未実測のため旧仮値を縮小）
  {
    id: 'signage',
    label: 'サイネージ',
    x: (SOT_BOUNDS.minX + SOT_BOUNDS.maxX) / 2 - SIGNAGE_WIDTH_M / 2,
    y: (SOT_BOUNDS.minY + SOT_BOUNDS.maxY) / 2 - SIGNAGE_HEIGHT_M / 2,
    width: SIGNAGE_WIDTH_M,
    height: SIGNAGE_HEIGHT_M,
  },
  // カフェは削除（不要になったため）
]

// コンセントの位置（メートル、点座標）。実際の設置位置が確定したらここを更新する。
export type Outlet = {
  id: string
  label: string
  x: number
  y: number
}

// イベントスペース内、等間隔に並ぶ5個の横方向の座標
const EVENT_SPACE_OUTLET_XS = [0.5, 2.125, 3.75, 5.375, 7.0]
const EVENT_SPACE_OUTLET_Y = 3.0

// 別室中央付近の6個（2列×3段）の座標（右壁沿いの5個に近づけすぎない範囲で少し右寄りに調整）
const BEKKAN_MID_COL_A_X = ROOM.widthM + RIGHT_AREA_WIDTH_M * 0.5
const BEKKAN_MID_COL_B_X = ROOM.widthM + RIGHT_AREA_WIDTH_M * 0.8
const BEKKAN_MID_OUTLET_YS = [0.8, 3.0, 5.2]

// 別室の右壁沿いの5個の座標
const BEKKAN_WALL_OUTLET_X = ROOM.widthM + RIGHT_AREA_WIDTH_M - 0.3
const BEKKAN_WALL_OUTLET_YS = [0.3, 1.65, 3.0, 4.35, 5.7]

// 実測前の暫定座標。件数・相対位置関係（イベントスペースに等間隔5個／別室中央に6個／
// 別室の右壁沿いに5個）は確定しているが、絶対位置は未実測のため仮値。実測が済み次第更新する。
export const OUTLETS_M: Outlet[] = [
  { id: 'outlet-1', label: 'コンセント', x: 0.5 * LEGACY_SCALE_X, y: 0.2 * LEGACY_SCALE_Y },
  { id: 'outlet-2', label: 'コンセント', x: 10.0 * LEGACY_SCALE_X, y: 0.2 * LEGACY_SCALE_Y },
  { id: 'outlet-3', label: 'コンセント', x: 0.5 * LEGACY_SCALE_X, y: ROOM.depthM - 0.2 * LEGACY_SCALE_Y },
  // イベントスペースに等間隔5個
  { id: 'outlet-4', label: 'コンセント', x: EVENT_SPACE_OUTLET_XS[0], y: EVENT_SPACE_OUTLET_Y },
  { id: 'outlet-5', label: 'コンセント', x: EVENT_SPACE_OUTLET_XS[1], y: EVENT_SPACE_OUTLET_Y },
  { id: 'outlet-6', label: 'コンセント', x: EVENT_SPACE_OUTLET_XS[2], y: EVENT_SPACE_OUTLET_Y },
  { id: 'outlet-7', label: 'コンセント', x: EVENT_SPACE_OUTLET_XS[3], y: EVENT_SPACE_OUTLET_Y },
  { id: 'outlet-8', label: 'コンセント', x: EVENT_SPACE_OUTLET_XS[4], y: EVENT_SPACE_OUTLET_Y },
  // 別室中央付近に6個（2列×3段）
  { id: 'outlet-9', label: 'コンセント', x: BEKKAN_MID_COL_A_X, y: BEKKAN_MID_OUTLET_YS[0] },
  { id: 'outlet-10', label: 'コンセント', x: BEKKAN_MID_COL_A_X, y: BEKKAN_MID_OUTLET_YS[1] },
  { id: 'outlet-11', label: 'コンセント', x: BEKKAN_MID_COL_A_X, y: BEKKAN_MID_OUTLET_YS[2] },
  { id: 'outlet-12', label: 'コンセント', x: BEKKAN_MID_COL_B_X, y: BEKKAN_MID_OUTLET_YS[0] },
  { id: 'outlet-13', label: 'コンセント', x: BEKKAN_MID_COL_B_X, y: BEKKAN_MID_OUTLET_YS[1] },
  { id: 'outlet-14', label: 'コンセント', x: BEKKAN_MID_COL_B_X, y: BEKKAN_MID_OUTLET_YS[2] },
  // 別室の右壁沿いに5個
  { id: 'outlet-15', label: 'コンセント', x: BEKKAN_WALL_OUTLET_X, y: BEKKAN_WALL_OUTLET_YS[0] },
  { id: 'outlet-16', label: 'コンセント', x: BEKKAN_WALL_OUTLET_X, y: BEKKAN_WALL_OUTLET_YS[1] },
  { id: 'outlet-17', label: 'コンセント', x: BEKKAN_WALL_OUTLET_X, y: BEKKAN_WALL_OUTLET_YS[2] },
  { id: 'outlet-18', label: 'コンセント', x: BEKKAN_WALL_OUTLET_X, y: BEKKAN_WALL_OUTLET_YS[3] },
  { id: 'outlet-19', label: 'コンセント', x: BEKKAN_WALL_OUTLET_X, y: BEKKAN_WALL_OUTLET_YS[4] },
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
  // 実測: 長机は幅120cm × 奥行45cm
  { id: 'standard', label: '長机', widthM: 1.2, depthM: 0.45, defaultMaxCount: 12 },
  // 実測: 3×3机は1.0m × 1.0m
  { id: 'square', label: '3×3', widthM: 1.0, depthM: 1.0, defaultMaxCount: 8 },
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
