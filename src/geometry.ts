export type Point = { x: number; y: number }

// レイキャスティング法による点と多角形の内外判定
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

// 矩形（任意角度に回転）の4隅すべてが多角形内にあるかで判定する簡易チェック
export function isRectInPolygon(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  polygon: Point[],
  rotationDeg = 0,
): boolean {
  const halfW = width / 2
  const halfH = height / 2
  const rad = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const localCorners: Point[] = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ]
  const corners = localCorners.map((c) => ({
    x: centerX + c.x * cos - c.y * sin,
    y: centerY + c.x * sin + c.y * cos,
  }))
  return corners.every((c) => isPointInPolygon(c, polygon))
}
