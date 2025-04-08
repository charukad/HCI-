"use client"

import { useRef, useCallback, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { useFurniture } from "../context/FurnitureContext"
import Room from "./Room"
import FurnitureItem from "./FurnitureItem"
import { ViewMode } from "../types"

interface VisualizerSceneProps {
  viewMode: ViewMode
}

export default function VisualizerScene({ viewMode }: VisualizerSceneProps) {
  const { furniture, room, selectedId, setSelectedId, updateFurniturePosition, captureSnapshot } = useFurniture()
  const controlsRef = useRef<any>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id)
  }

  const handleDrag = (id: string, position: [number, number, number]) => {
    updateFurniturePosition(id, position)
  }

  // Handle capturing snapshot of the current view
  const handleCapture = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png")
      captureSnapshot(dataUrl)
    }
  }, [captureSnapshot])

  // Force canvas to update when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Force Three.js to update the canvas size
        const canvas = canvasRef.current
        const renderer = canvas.__r3f?.fiber?.renderer
        if (renderer) {
          renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        }
      }
    }

    // Create a ResizeObserver to detect container size changes
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(containerRef.current)

      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current)
        }
      }
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas shadows ref={canvasRef as any}>
        <color attach="background" args={["#f0f0f0"]} />

        {viewMode === ViewMode.ThreeD ? (
          <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        ) : (
          <PerspectiveCamera makeDefault position={[0, 15, 0.001]} rotation={[-Math.PI / 2, 0, 0]} />
        )}

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />

        <Room
          width={room.width}
          length={room.length}
          height={room.height}
          wallColor={room.wallColor}
          floorColor={room.floorColor}
          wallTexture={room.wallTexture}
          floorTexture={room.floorTexture}
        />

        {furniture.map((item) => (
          <FurnitureItem
            key={item.id}
            {...item}
            isSelected={item.id === selectedId}
            onSelect={() => handleSelect(item.id)}
            onDrag={(pos) => handleDrag(item.id, pos)}
          />
        ))}

        <Environment preset="apartment" />
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableRotate={viewMode === ViewMode.ThreeD}
          enableZoom={true}
          minPolarAngle={0}
          maxPolarAngle={viewMode === ViewMode.ThreeD ? Math.PI / 2 : 0}
        />
      </Canvas>
    </div>
  )
}

