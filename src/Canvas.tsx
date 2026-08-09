import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Text, Group, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { FIXED_ELEMENTS_PX, ROOM_BOUNDS_PX, ROOM_POLYGON_PX, getDeskTypePx } from './config'
import { isRectInPolygon } from './geometry'
import { useLayoutStore } from './store'

function isOutOfBounds(
  x: number,
  y: number,
  rotation: number,
  deskWidth: number,
  deskHeight: number,
): boolean {
  return !isRectInPolygon(x, y, deskWidth, deskHeight, ROOM_POLYGON_PX, rotation)
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
  const [size, setSize] = useState({ width: 800, height: 600 })
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
    const clamped = Math.min(Math.max(newScale, 0.3), 3)
    setScale(clamped)
    setStagePos({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    })
  }

  const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      selectDesk(null)
    }
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden bg-slate-100">
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
            setStagePos({ x: e.target.x(), y: e.target.y() })
          }
        }}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          <Line
            points={ROOM_POLYGON_PX.flatMap((p) => [p.x, p.y])}
            closed
            fill="#ffffff"
            stroke="#1f2937"
            strokeWidth={2}
          />
          <FixedElements />

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
            borderStroke="#2563eb"
            anchorStroke="#2563eb"
            anchorFill="#ffffff"
          />
        </Layer>
      </Stage>
    </div>
  )
}
