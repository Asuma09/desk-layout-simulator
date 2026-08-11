import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Text, Group, Circle, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import {
  FIXED_ELEMENTS_PX,
  OUTLETS_PX,
  ROOM_BOUNDS_PX,
  ROOM_POLYGON_PX,
  SURROUNDING_ROOMS_PX,
  getDeskTypePx,
} from './config'
import { isRectInPolygon } from './geometry'
import { useLayoutStore } from './store'

const MIN_SCALE = 0.1
const MAX_SCALE = 4
const FIT_PADDING = 40

function isOutOfBounds(
  x: number,
  y: number,
  rotation: number,
  deskWidth: number,
  deskHeight: number,
): boolean {
  return !isRectInPolygon(x, y, deskWidth, deskHeight, ROOM_POLYGON_PX, rotation)
}

function computeFitView(containerWidth: number, containerHeight: number) {
  const roomWidth = ROOM_BOUNDS_PX.maxX - ROOM_BOUNDS_PX.minX
  const roomHeight = ROOM_BOUNDS_PX.maxY - ROOM_BOUNDS_PX.minY
  const availWidth = Math.max(containerWidth - FIT_PADDING * 2, 50)
  const availHeight = Math.max(containerHeight - FIT_PADDING * 2, 50)
  const scale = Math.min(
    Math.max(Math.min(availWidth / roomWidth, availHeight / roomHeight), MIN_SCALE),
    MAX_SCALE,
  )
  return {
    scale,
    pos: {
      x: (containerWidth - roomWidth * scale) / 2 - ROOM_BOUNDS_PX.minX * scale,
      y: (containerHeight - roomHeight * scale) / 2 - ROOM_BOUNDS_PX.minY * scale,
    },
  }
}

function touchDistance(t1: Touch, t2: Touch): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function touchCenter(t1: Touch, t2: Touch): { x: number; y: number } {
  return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
}

function SurroundingRooms() {
  return (
    <>
      {SURROUNDING_ROOMS_PX.map((room) => {
        const xs = room.points.map((p) => p.x)
        const ys = room.points.map((p) => p.y)
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2
        return (
          <Group key={room.id} listening={false}>
            <Line
              points={room.points.flatMap((p) => [p.x, p.y])}
              closed
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth={1.5}
              dash={[6, 4]}
            />
            <Text
              text={room.label}
              x={cx - 40}
              y={cy - 7}
              width={80}
              align="center"
              fontSize={12}
              fill="#94a3b8"
            />
          </Group>
        )
      })}
    </>
  )
}

function OutletMarkers() {
  return (
    <>
      {OUTLETS_PX.map((o) => (
        <Group key={o.id} x={o.x} y={o.y} listening={false}>
          <Circle radius={9} fill="#fbbf24" stroke="#b45309" strokeWidth={1.5} />
          <Rect x={-3.5} y={-1} width={2.5} height={2} fill="#b45309" />
          <Rect x={1} y={-1} width={2.5} height={2} fill="#b45309" />
          <Text
            text={o.label}
            x={-30}
            y={12}
            width={60}
            align="center"
            fontSize={9}
            fill="#92400e"
          />
        </Group>
      ))}
    </>
  )
}

function FixedElements() {
  return (
    <>
      {FIXED_ELEMENTS_PX.map((el) => (
        <Group key={el.id} x={el.x} y={el.y} listening={false}>
          <Rect
            width={el.width}
            height={el.height}
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth={1.5}
            cornerRadius={2}
          />
          <Text
            text={el.label}
            width={el.width}
            height={el.height}
            align="center"
            verticalAlign="middle"
            fontSize={13}
            fill="#334155"
          />
        </Group>
      ))}
    </>
  )
}

type CanvasProps = {
  stageRef: React.RefObject<Konva.Stage | null>
}

export default function Canvas({ stageRef }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const deskNodeRefs = useRef<Map<string, Konva.Group>>(new Map())
  const hasInteractedRef = useRef(false)
  const pinchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)
  const [stagePos, setStagePos] = useState({
    x: 40 - ROOM_BOUNDS_PX.minX,
    y: 40 - ROOM_BOUNDS_PX.minY,
  })

  const desks = useLayoutStore((s) => s.desks)
  const selectedId = useLayoutStore((s) => s.selectedId)
  const selectDesk = useLayoutStore((s) => s.selectDesk)
  const beginDrag = useLayoutStore((s) => s.beginDrag)
  const updateDeskPosition = useLayoutStore((s) => s.updateDeskPosition)
  const updateDeskRotation = useLayoutStore((s) => s.updateDeskRotation)
  const endDrag = useLayoutStore((s) => s.endDrag)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (hasInteractedRef.current) return
    if (size.width === 0 || size.height === 0) return
    const fit = computeFitView(size.width, size.height)
    setScale(fit.scale)
    setStagePos(fit.pos)
  }, [size])

  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const node = selectedId ? deskNodeRefs.current.get(selectedId) : undefined
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedId, desks])

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    hasInteractedRef.current = true
    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    }
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const scaleBy = 1.05
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clamped = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE)
    setScale(clamped)
    setStagePos({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    })
  }

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches
    if (touches.length < 2) return
    e.evt.preventDefault()
    hasInteractedRef.current = true
    const stage = stageRef.current
    if (!stage) return
    if (stage.isDragging()) stage.stopDrag()

    const [t1, t2] = [touches[0], touches[1]]
    const dist = touchDistance(t1, t2)
    const stageBox = stage.container().getBoundingClientRect()
    const rawCenter = touchCenter(t1, t2)
    const center = { x: rawCenter.x - stageBox.left, y: rawCenter.y - stageBox.top }

    const prev = pinchRef.current
    if (!prev) {
      pinchRef.current = { dist, center }
      return
    }

    const oldScale = scale
    const pointTo = {
      x: (prev.center.x - stagePos.x) / oldScale,
      y: (prev.center.y - stagePos.y) / oldScale,
    }
    const newScale = Math.min(Math.max(oldScale * (dist / prev.dist), MIN_SCALE), MAX_SCALE)
    setScale(newScale)
    setStagePos({
      x: center.x - pointTo.x * newScale,
      y: center.y - pointTo.y * newScale,
    })
    pinchRef.current = { dist, center }
  }

  const handleTouchEnd = (e: KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length < 2) {
      pinchRef.current = null
    }
  }

  const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      selectDesk(null)
    }
  }

  return (
    <div ref={containerRef} className="h-full w-full touch-none overflow-hidden bg-slate-100">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        draggable
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            hasInteractedRef.current = true
            setStagePos({ x: e.target.x(), y: e.target.y() })
          }
        }}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          <SurroundingRooms />
          <Line
            points={ROOM_POLYGON_PX.flatMap((p) => [p.x, p.y])}
            closed
            fill="#ffffff"
            stroke="#1f2937"
            strokeWidth={2}
          />
          <FixedElements />
          <OutletMarkers />

          {desks.map((desk) => {
            const deskPx = getDeskTypePx(desk.typeId)
            const outOfBounds = isOutOfBounds(
              desk.x,
              desk.y,
              desk.rotation,
              deskPx.width,
              deskPx.height,
            )
            const selected = desk.id === selectedId
            return (
              <Group
                key={desk.id}
                ref={(node) => {
                  if (node) deskNodeRefs.current.set(desk.id, node)
                  else deskNodeRefs.current.delete(desk.id)
                }}
                x={desk.x}
                y={desk.y}
                rotation={desk.rotation}
                draggable
                onClick={(e) => {
                  e.cancelBubble = true
                  selectDesk(desk.id)
                }}
                onTap={(e) => {
                  e.cancelBubble = true
                  selectDesk(desk.id)
                }}
                onDragStart={() => {
                  beginDrag()
                  selectDesk(desk.id)
                }}
                onDragMove={(e) => {
                  const node = e.target
                  updateDeskPosition(desk.id, node.x(), node.y())
                }}
                onDragEnd={() => {
                  endDrag()
                }}
                onTransformStart={() => {
                  beginDrag()
                }}
                onTransform={(e) => {
                  const node = e.target
                  updateDeskRotation(desk.id, node.rotation())
                }}
                onTransformEnd={() => {
                  endDrag()
                }}
              >
                <Rect
                  offsetX={deskPx.width / 2}
                  offsetY={deskPx.height / 2}
                  width={deskPx.width}
                  height={deskPx.height}
                  fill={outOfBounds ? '#fecaca' : '#bfdbfe'}
                  stroke={selected ? '#2563eb' : outOfBounds ? '#dc2626' : '#3b82f6'}
                  strokeWidth={selected ? 3 : 1.5}
                  cornerRadius={4}
                />
              </Group>
            )
          })}

          <Transformer
            ref={trRef}
            rotateEnabled
            enabledAnchors={[]}
            rotationSnaps={[]}
            anchorSize={28}
            anchorCornerRadius={14}
            borderStroke="#2563eb"
            anchorStroke="#2563eb"
            anchorFill="#ffffff"
            anchorStrokeWidth={2}
          />
        </Layer>
      </Stage>
    </div>
  )
}
