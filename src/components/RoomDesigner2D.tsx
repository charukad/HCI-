"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useFurniture } from "../context/FurnitureContext"
import { type Point, type Wall, WorkflowStep } from "../types"

export default function RoomDesigner2D() {
  const { room, addWall, updateWall, removeWall, setWorkflowStep, setRoom } = useFurniture()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedWallId, setDraggedWallId] = useState<string | null>(null)
  const [draggedPoint, setDraggedPoint] = useState<"start" | "end" | "wall" | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)
  const [gridSize, setGridSize] = useState(20) 
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [snapDistance, setSnapDistance] = useState(0.5) 
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [snapPoint, setSnapPoint] = useState<Point | null>(null)
  const [connectionPoints, setConnectionPoints] = useState<Point[]>([])
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<{ point: Point; type: "start" | "end" } | null>(null)

  // Make canvas responsive
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setCanvasSize({
          width: width - 40, // Account for margins
          height: height - 100, // Account for buttons and margins
        })
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  // Add keyboard event listener for delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedWallId) {
        removeWall(selectedWallId)
        setSelectedWallId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedWallId, removeWall])

  // Convert canvas coordinates to room coordinates
  const canvasToRoom = (x: number, y: number): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const canvasX = x - rect.left
    const canvasY = y - rect.top

    // Center of canvas is (0,0) in room coordinates
    const roomX = (canvasX - canvas.width / 2) / gridSize
    const roomY = (canvasY - canvas.height / 2) / gridSize

    return { x: roomX, y: roomY }
  }

  // Convert room coordinates to canvas coordinates
  const roomToCanvas = (point: Point): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    // Center of canvas is (0,0) in room coordinates
    const canvasX = point.x * gridSize + canvas.width / 2
    const canvasY = point.y * gridSize + canvas.height / 2

    return { x: canvasX, y: canvasY }
  }

  // Find all connection points (wall endpoints)
  const findConnectionPoints = () => {
    const points: Point[] = []
    const pointMap = new Map<string, Point>()

    room.walls.forEach((wall) => {
      // Use string keys to identify unique points
      const startKey = `${wall.start.x.toFixed(3)},${wall.start.y.toFixed(3)}`
      const endKey = `${wall.end.x.toFixed(3)},${wall.end.y.toFixed(3)}`

      if (!pointMap.has(startKey)) {
        pointMap.set(startKey, wall.start)
      }

      if (!pointMap.has(endKey)) {
        pointMap.set(endKey, wall.end)
      }
    })

    return Array.from(pointMap.values())
  }

  // Update connection points when walls change
  useEffect(() => {
    setConnectionPoints(findConnectionPoints())
  }, [room.walls])

  // Check if a point is near an existing connection point
  const findNearestConnectionPoint = (point: Point): Point | null => {
    for (const existingPoint of connectionPoints) {
      const dx = existingPoint.x - point.x
      const dy = existingPoint.y - point.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < snapDistance) {
        return existingPoint
      }
    }
    return null
  }

  // Snap point to grid or existing points
  const snapToGridOrPoint = (point: Point): Point => {
    if (!snapEnabled) return point

    // First check if we should snap to an existing connection point
    const nearestPoint = findNearestConnectionPoint(point)
    if (nearestPoint) {
      setSnapPoint(nearestPoint)
      return nearestPoint
    }

    // Then check if we should snap to a point on an existing wall
    for (const wall of room.walls) {
      // Check if point is near the wall line
      const distance = distanceToWall(point, wall)

      if (distance < snapDistance / 2) {
        // Find the closest point on the wall
        const { start, end } = wall
        const dx = end.x - start.x
        const dy = end.y - start.y
        const lengthSq = dx * dx + dy * dy

        if (lengthSq === 0) continue

        // Calculate projection of point onto line
        const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq))

        // Closest point on line
        const snapX = start.x + t * dx
        const snapY = start.y + t * dy

        const snapPointOnWall = { x: snapX, y: snapY }
        setSnapPoint(snapPointOnWall)
        return snapPointOnWall
      }
    }

    // If not snapping to endpoint or wall, snap to grid
    setSnapPoint(null)
    const snappedX = Math.round(point.x)
    const snappedY = Math.round(point.y)
    return { x: snappedX, y: snappedY }
  }

  // Check if a point is near a wall endpoint
  const isNearWallEndpoint = (point: Point, wall: Wall): { isNear: boolean; type: "start" | "end" | null } => {
    const startDx = wall.start.x - point.x
    const startDy = wall.start.y - point.y
    const startDistance = Math.sqrt(startDx * startDx + startDy * startDy)

    const endDx = wall.end.x - point.x
    const endDy = wall.end.y - point.y
    const endDistance = Math.sqrt(endDx * endDx + endDy * endDy)

    if (startDistance < snapDistance) {
      return { isNear: true, type: "start" }
    }

    if (endDistance < snapDistance) {
      return { isNear: true, type: "end" }
    }

    return { isNear: false, type: null }
  }

  // Draw the room on the canvas
  const drawRoom = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 0.5

    // Vertical grid lines
    for (let x = canvas.width / 2; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(canvas.width - x, 0)
      ctx.lineTo(canvas.width - x, canvas.height)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let y = canvas.height / 2; y < canvas.width; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, canvas.height - y)
      ctx.lineTo(canvas.width, canvas.height - y)
      ctx.stroke()
    }

    // Draw center axes
    ctx.strokeStyle = "#999"
    ctx.lineWidth = 1

    // X-axis
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Draw walls
    room.walls.forEach((wall) => {
      const start = roomToCanvas(wall.start)
      const end = roomToCanvas(wall.end)

      // Draw wall
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)

      // Highlight selected or hovered wall
      if (wall.id === selectedWallId) {
        ctx.strokeStyle = "#4285F4"
        ctx.lineWidth = 5
      } else if (wall.id === hoveredWallId) {
        ctx.strokeStyle = "#42A5F5"
        ctx.lineWidth = 4
      } else {
        ctx.strokeStyle = "#333"
        ctx.lineWidth = 3
      }

      ctx.stroke()
    })

    // Draw connection points (wall endpoints)
    connectionPoints.forEach((point) => {
      const { x, y } = roomToCanvas(point)

      // Check if this point is being hovered
      const isHovered =
        hoveredPoint &&
        Math.abs(hoveredPoint.point.x - point.x) < 0.01 &&
        Math.abs(hoveredPoint.point.y - point.y) < 0.01

      // Draw connection point with larger highlight
      ctx.fillStyle = isHovered ? "#4CAF50" : "#333"
      ctx.beginPath()
      ctx.arc(x, y, isHovered ? 8 : 6, 0, Math.PI * 2)
      ctx.fill()

      // Draw white center to make it look like a ring
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw current line if drawing
    if (isDrawing && startPoint && currentPoint) {
      const start = roomToCanvas(startPoint)
      const end = roomToCanvas(currentPoint)

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.strokeStyle = "#4285F4"
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw endpoint of current line
      ctx.fillStyle = "#4285F4"
      ctx.beginPath()
      ctx.arc(end.x, end.y, 5, 0, Math.PI * 2)
      ctx.fill()

      // Draw startpoint of current line
      ctx.fillStyle = "#4285F4"
      ctx.beginPath()
      ctx.arc(start.x, start.y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw snap point indicator
    if (snapPoint) {
      const { x, y } = roomToCanvas(snapPoint)
      ctx.fillStyle = "#4CAF50"
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw room dimensions
    if (room.walls.length > 0) {
      ctx.font = "12px Arial"
      ctx.fillStyle = "#666"

      room.walls.forEach((wall) => {
        const start = roomToCanvas(wall.start)
        const end = roomToCanvas(wall.end)

        // Calculate wall length
        const dx = wall.end.x - wall.start.x
        const dy = wall.end.y - wall.start.y
        const length = Math.sqrt(dx * dx + dy * dy).toFixed(1)

        // Calculate midpoint for label
        const midX = (start.x + end.x) / 2
        const midY = (start.y + end.y) / 2

        // Calculate offset for label (perpendicular to wall)
        const angle = Math.atan2(end.y - start.y, end.x - start.x)
        const offsetX = Math.sin(angle) * 15
        const offsetY = -Math.cos(angle) * 15

        // Draw dimension label
        ctx.fillText(`${length}m`, midX + offsetX, midY + offsetY)
      })
    }

    // Draw room area if room is closed
    if (isRoomClosed()) {
      const points = getOrderedRoomPoints()
      if (points.length > 2) {
        // Calculate room area
        const area = calculatePolygonArea(points)

        // Draw area label in the center of the room
        ctx.font = "bold 14px Arial"
        ctx.fillStyle = "#4285F4"

        // Find center of room
        let centerX = 0,
          centerY = 0
        points.forEach((point) => {
          centerX += point.x
          centerY += point.y
        })
        centerX /= points.length
        centerY /= points.length

        const canvasCenter = roomToCanvas({ x: centerX, y: centerY })
        ctx.fillText(`Area: ${area.toFixed(1)} m²`, canvasCenter.x - 40, canvasCenter.y)
      }
    }
  }

  // Calculate area of polygon
  const calculatePolygonArea = (points: Point[]): number => {
    let area = 0

    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }

    return Math.abs(area) / 2
  }

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const roomPoint = canvasToRoom(e.clientX, e.clientY)
    const snappedPoint = snapToGridOrPoint(roomPoint)

    // Check if clicking on a wall endpoint
    for (const wall of room.walls) {
      const { isNear, type } = isNearWallEndpoint(roomPoint, wall)
      if (isNear && type) {
        // Start dragging this endpoint
        setIsDragging(true)
        setDraggedWallId(wall.id)
        setDraggedPoint(type)
        setSelectedWallId(wall.id)
        return
      }
    }

    // Check if clicking on an existing wall
    const clickedWall = findWallNearPoint(roomPoint)

    if (clickedWall) {
      // Select wall
      setSelectedWallId(clickedWall.id)

      // If it's a double click, start dragging the wall
      if (selectedWallId === clickedWall.id) {
        setIsDragging(true)
        setDraggedWallId(clickedWall.id)
        setDraggedPoint("wall")
      }
    } else {
      // Start drawing new wall
      setIsDrawing(true)
      setStartPoint(snappedPoint)
      setCurrentPoint(snappedPoint)
      setSelectedWallId(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const roomPoint = canvasToRoom(e.clientX, e.clientY)
    const snappedPoint = snapToGridOrPoint(roomPoint)

    // Handle wall endpoint hovering
    let foundHoveredPoint = false
    for (const wall of room.walls) {
      const { isNear, type } = isNearWallEndpoint(roomPoint, wall)
      if (isNear && type) {
        setHoveredPoint({
          point: type === "start" ? wall.start : wall.end,
          type,
        })
        foundHoveredPoint = true
        break
      }
    }

    if (!foundHoveredPoint) {
      setHoveredPoint(null)
    }

    // Handle wall hovering
    if (!isDrawing && !isDragging) {
      const hoveredWall = findWallNearPoint(roomPoint)
      setHoveredWallId(hoveredWall ? hoveredWall.id : null)
    }

    if (isDrawing) {
      setCurrentPoint(snappedPoint)
    } else if (isDragging && draggedWallId) {
      const wall = room.walls.find((w) => w.id === draggedWallId)
      if (wall) {
        if (draggedPoint === "start") {
          // Dragging start point
          updateWall(draggedWallId, snappedPoint, wall.end)
        } else if (draggedPoint === "end") {
          // Dragging end point
          updateWall(draggedWallId, wall.start, snappedPoint)
        } else if (draggedPoint === "wall") {
          // Dragging entire wall
          const dx = snappedPoint.x - roomPoint.x
          const dy = snappedPoint.y - roomPoint.y

          const newStart = {
            x: wall.start.x + dx,
            y: wall.start.y + dy,
          }

          const newEnd = {
            x: wall.end.x + dx,
            y: wall.end.y + dy,
          }

          updateWall(draggedWallId, newStart, newEnd)
        }
      }
    }

    // Always redraw to show snap points even when not drawing
    drawRoom()
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && startPoint && currentPoint) {
      // Only add wall if it has some length
      const dx = currentPoint.x - startPoint.x
      const dy = currentPoint.y - startPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 0.2) {
        // Minimum 0.2 meter length
        // Check if either endpoint is very close to an existing endpoint
        // If so, use the exact coordinates of the existing endpoint to ensure perfect connections
        let finalStartPoint = startPoint
        let finalEndPoint = currentPoint

        // Check start point
        const nearestStartPoint = findNearestConnectionPoint(startPoint)
        if (nearestStartPoint) {
          finalStartPoint = nearestStartPoint
        }

        // Check end point
        const nearestEndPoint = findNearestConnectionPoint(currentPoint)
        if (nearestEndPoint) {
          finalEndPoint = nearestEndPoint
        }

        addWall(finalStartPoint, finalEndPoint)
      }

      setIsDrawing(false)
      setStartPoint(null)
      setCurrentPoint(null)
    }

    if (isDragging) {
      setIsDragging(false)
      setDraggedWallId(null)
      setDraggedPoint(null)
    }
  }

  // Find a wall near a point (for selection)
  const findWallNearPoint = (point: Point): Wall | null => {
    const threshold = 0.5 // Distance threshold in meters

    for (const wall of room.walls) {
      // Calculate distance from point to line segment (wall)
      const distance = distanceToWall(point, wall)

      if (distance < threshold) {
        return wall
      }
    }

    return null
  }

  // Calculate distance from point to wall
  const distanceToWall = (point: Point, wall: Wall): number => {
    const { start, end } = wall

    // Vector from start to end
    const dx = end.x - start.x
    const dy = end.y - start.y

    // Length of wall squared
    const lengthSq = dx * dx + dy * dy

    if (lengthSq === 0) {
      // Wall has zero length, return distance to start point
      return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2)
    }

    // Calculate projection of point onto line
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq))

    // Closest point on line
    const projX = start.x + t * dx
    const projY = start.y + t * dy

    // Distance from point to closest point on line
    return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2)
  }

  // Delete selected wall
  const handleDeleteWall = () => {
    if (selectedWallId) {
      removeWall(selectedWallId)
      setSelectedWallId(null)
    }
  }

  // Create a rectangular room
  const createRectangularRoom = () => {
    // Clear existing walls
    room.walls.forEach((wall) => removeWall(wall.id))

    // Room dimensions in meters
    const width = room.width / 2
    const length = room.length / 2

    // Create four walls for a rectangle
    const topLeft = { x: -width, y: -length }
    const topRight = { x: width, y: -length }
    const bottomRight = { x: width, y: length }
    const bottomLeft = { x: -width, y: length }

    addWall(topLeft, topRight)
    addWall(topRight, bottomRight)
    addWall(bottomRight, bottomLeft)
    addWall(bottomLeft, topLeft)
  }

  // Close the room by connecting the last point to the first
  const closeRoom = () => {
    if (room.walls.length < 2) return

    // Find all unique endpoints
    const endpoints: Point[] = []
    const endpointMap = new Map<string, { point: Point; count: number }>()

    room.walls.forEach((wall) => {
      const startKey = `${wall.start.x.toFixed(3)},${wall.start.y.toFixed(3)}`
      const endKey = `${wall.end.x.toFixed(3)},${wall.end.y.toFixed(3)}`

      if (!endpointMap.has(startKey)) {
        endpointMap.set(startKey, { point: wall.start, count: 1 })
      } else {
        endpointMap.get(startKey)!.count++
      }

      if (!endpointMap.has(endKey)) {
        endpointMap.set(endKey, { point: wall.end, count: 1 })
      } else {
        endpointMap.get(endKey)!.count++
      }
    })

    // Find endpoints that only appear once (these are the open ends)
    const openEndpoints: Point[] = []
    endpointMap.forEach(({ point, count }, key) => {
      if (count === 1) {
        openEndpoints.push(point)
      }
    })

    // If we have exactly 2 open endpoints, connect them
    if (openEndpoints.length === 2) {
      addWall(openEndpoints[0], openEndpoints[1])
    }
  }

  // Check if room is closed
  const isRoomClosed = (): boolean => {
    if (room.walls.length < 3) return false

    // Create a map of all endpoints
    const endpointMap = new Map<string, number>()

    room.walls.forEach((wall) => {
      const startKey = `${wall.start.x.toFixed(3)},${wall.start.y.toFixed(3)}`
      const endKey = `${wall.end.x.toFixed(3)},${wall.end.y.toFixed(3)}`

      endpointMap.set(startKey, (endpointMap.get(startKey) || 0) + 1)
      endpointMap.set(endKey, (endpointMap.get(endKey) || 0) + 1)
    })

    // In a closed shape, each point should appear exactly twice
    return Array.from(endpointMap.values()).every((count) => count === 2)
  }

  // Get ordered points of the room (for floor creation)
  const getOrderedRoomPoints = (): Point[] => {
    if (room.walls.length < 3) return []

    // Create a map of all endpoints and their connected points
    const connections = new Map<string, Set<string>>()

    room.walls.forEach((wall) => {
      const startKey = `${wall.start.x.toFixed(3)},${wall.start.y.toFixed(3)}`
      const endKey = `${wall.end.x.toFixed(3)},${wall.end.y.toFixed(3)}`

      if (!connections.has(startKey)) {
        connections.set(startKey, new Set<string>())
      }
      connections.get(startKey)!.add(endKey)

      if (!connections.has(endKey)) {
        connections.set(endKey, new Set<string>())
      }
      connections.get(endKey)!.add(startKey)
    })

    // Convert keys back to points
    const keyToPoint = new Map<string, Point>()
    room.walls.forEach((wall) => {
      const startKey = `${wall.start.x.toFixed(3)},${wall.start.y.toFixed(3)}`
      const endKey = `${wall.end.x.toFixed(3)},${wall.end.y.toFixed(3)}`

      keyToPoint.set(startKey, wall.start)
      keyToPoint.set(endKey, wall.end)
    })

    // Start with any point
    const startKey = Array.from(connections.keys())[0]
    const orderedKeys: string[] = [startKey]
    let currentKey = startKey

    // Follow connections to get ordered points
    while (orderedKeys.length < connections.size) {
      const connectedKeys = Array.from(connections.get(currentKey) || new Set<string>())

      // Find a connected point that hasn't been visited yet
      const nextKey = connectedKeys.find((key) => !orderedKeys.includes(key))

      if (!nextKey) break // Can't find next point, might not be a closed shape

      orderedKeys.push(nextKey)
      currentKey = nextKey
    }

    // Convert keys to points
    return orderedKeys.map((key) => keyToPoint.get(key)!).filter(Boolean)
  }

  // Proceed to 3D view
  const proceedTo3D = () => {
    // Calculate room dimensions from walls
    if (room.walls.length > 0) {
      let minX = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      room.walls.forEach((wall) => {
        minX = Math.min(minX, wall.start.x, wall.end.x)
        maxX = Math.max(maxX, wall.start.x, wall.end.x)
        minY = Math.min(minY, wall.start.y, wall.end.y)
        maxY = Math.max(maxY, wall.start.y, wall.end.y)
      })

      const width = maxX - minX
      const length = maxY - minY

      // Update room dimensions
      setRoom({
        ...room,
        width,
        length,
      })
    }

    // Move to next step
    setWorkflowStep(WorkflowStep.RoomView3D)
  }

  // Initialize canvas and draw room
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Initial draw
    drawRoom()
  }, [canvasSize])

  // Redraw when room changes
  useEffect(() => {
    drawRoom()
  }, [room.walls, selectedWallId, gridSize, snapPoint, connectionPoints, hoveredWallId, hoveredPoint])

  // Redraw when current point changes during drawing
  useEffect(() => {
    if (isDrawing) {
      drawRoom()
    }
  }, [currentPoint])

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", padding: "20px" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 10px", color: "#333" }}>2D Room Designer</h2>
        <p style={{ margin: "0", color: "#666" }}>
          Draw your room layout by clicking and dragging to create walls.
          {isRoomClosed() ? (
            <span style={{ color: "#4CAF50", fontWeight: "bold" }}> Room is closed and ready for 3D conversion.</span>
          ) : (
            <span style={{ color: "#FF9800" }}> Connect walls to create a closed room.</span>
          )}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ position: "relative", margin: "0 auto" }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              border: "1px solid #ccc",
              background: "#f8f8f8",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              cursor: isDragging ? "grabbing" : hoveredWallId || hoveredPoint ? "pointer" : "crosshair",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(255,255,255,0.9)",
              padding: "10px",
              borderRadius: "4px",
              boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
              fontSize: "14px",
            }}
          >
            <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Instructions:</div>
            <div>• Grid: 1 square = 1 meter</div>
            <div>• Click and drag to draw walls</div>
            <div>• Click on a wall to select it</div>
            <div>• Click and drag wall endpoints to move them</div>
            <div>• Double-click a wall to move the entire wall</div>
            <div>• Select a wall and press Delete key to remove it</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center" }}>
        <button
          onClick={createRectangularRoom}
          style={{
            padding: "10px 16px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Create Rectangular Room
        </button>

        <button
          onClick={closeRoom}
          disabled={room.walls.length < 2 || isRoomClosed()}
          style={{
            padding: "10px 16px",
            backgroundColor: room.walls.length < 2 || isRoomClosed() ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: room.walls.length < 2 || isRoomClosed() ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          Close Room
        </button>

        <button
          onClick={handleDeleteWall}
          disabled={!selectedWallId}
          style={{
            padding: "10px 16px",
            backgroundColor: selectedWallId ? "#f44336" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: selectedWallId ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          Delete Selected Wall
        </button>

        <button
          onClick={() => setSnapEnabled(!snapEnabled)}
          style={{
            padding: "10px 16px",
            backgroundColor: snapEnabled ? "#4CAF50" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {snapEnabled ? "Snap: ON" : "Snap: OFF"}
        </button>

        <button
          onClick={proceedTo3D}
          style={{
            padding: "10px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Convert to 3D
        </button>
      </div>
    </div>
  )
}

