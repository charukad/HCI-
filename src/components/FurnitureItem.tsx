"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import Sofa from "./Sofa"
import Armchair from "./Armchair"
import CoffeeTable from "./CoffeeTable"
import TvStand from "./TvStand"
import Plant from "./Plant"
import Lamp from "./Lamp"
import { FurnitureType } from "../types"
import { useFurniture } from "../context/FurnitureContext"

// Define approximate furniture dimensions for boundary calculations
const FURNITURE_DIMENSIONS = {
  [FurnitureType.SOFA]: { width: 2.2, depth: 1.0 },
  [FurnitureType.ARMCHAIR]: { width: 1.1, depth: 1.0 },
  [FurnitureType.COFFEE_TABLE]: { width: 1.2, depth: 0.7 },
  [FurnitureType.TV_STAND]: { width: 2.0, depth: 0.5 },
  [FurnitureType.PLANT]: { width: 0.4, depth: 0.4 },
  [FurnitureType.LAMP]: { width: 0.5, depth: 0.5 },
}

interface FurnitureItemProps {
  id: string
  type: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  isSelected: boolean
  onSelect: () => void
  onDrag: (position: [number, number, number]) => void
}

export default function FurnitureItem({
  id,
  type,
  position,
  rotation,
  scale,
  color,
  isSelected,
  onSelect,
  onDrag,
}: FurnitureItemProps) {
  const ref = useRef<THREE.Group>(null)
  const { camera, raycaster, pointer, gl } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const { room } = useFurniture()

  // Get furniture dimensions for boundary calculations
  const furnitureDimensions = FURNITURE_DIMENSIONS[type as FurnitureType] || { width: 1, depth: 1 }

  // Calculate effective dimensions based on scale and rotation
  const calculateEffectiveDimensions = () => {
    const baseWidth = furnitureDimensions.width * scale[0]
    const baseDepth = furnitureDimensions.depth * scale[2]

    // Calculate rotation angle in radians (only y-axis rotation matters for horizontal rotation)
    const angle = rotation[1]

    // Calculate effective width and depth after rotation using bounding box principle
    // This is a simplified approximation that works well for most furniture
    const effectiveWidth = Math.abs(baseWidth * Math.cos(angle)) + Math.abs(baseDepth * Math.sin(angle))
    const effectiveDepth = Math.abs(baseWidth * Math.sin(angle)) + Math.abs(baseDepth * Math.cos(angle))

    return {
      width: effectiveWidth,
      depth: effectiveDepth,
    }
  }

  const { width: effectiveWidth, depth: effectiveDepth } = calculateEffectiveDimensions()
  const halfWidth = effectiveWidth / 2
  const halfDepth = effectiveDepth / 2

  // Custom drag implementation
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation()
    setIsDragging(true)
    gl.domElement.style.cursor = "grabbing"
  }

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false)
      gl.domElement.style.cursor = "auto"
    }
  }

  const handlePointerMove = (e: THREE.Event) => {
    if (isDragging) {
      e.stopPropagation()

      // Update the raycaster with current pointer position
      raycaster.setFromCamera(pointer, camera)

      // Calculate intersection with a plane at y=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersectionPoint = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, intersectionPoint)

      // Calculate room boundaries with margins for furniture size
      const roomHalfWidth = room.width / 2
      const roomHalfLength = room.length / 2

      // Clamp position to stay within room boundaries
      const clampedX = Math.max(-roomHalfWidth + halfWidth, Math.min(roomHalfWidth - halfWidth, intersectionPoint.x))
      const clampedZ = Math.max(-roomHalfLength + halfDepth, Math.min(roomHalfLength - halfDepth, intersectionPoint.z))

      // Update position with clamped values
      onDrag([clampedX, position[1], clampedZ])
    }
  }

  // Highlight effect when selected
  useFrame(() => {
    if (ref.current && isSelected) {
      // Apply a pulsing effect to the selection indicator
      const time = Date.now() * 0.001
      const pulse = Math.sin(time * 2) * 0.05 + 1

      // Only scale the selection indicator, not the actual furniture
      if (ref.current.children.length > 1) {
        const selectionIndicator = ref.current.children[1] as THREE.Mesh
        selectionIndicator.scale.set(pulse, 1, pulse)
      }
    }
  })

  // Ensure furniture is within bounds when room size changes or furniture is scaled/rotated
  useEffect(() => {
    const roomHalfWidth = room.width / 2
    const roomHalfLength = room.length / 2

    // Check if furniture is outside room boundaries after room resize or furniture change
    const isOutsideBounds =
      Math.abs(position[0]) > roomHalfWidth - halfWidth || Math.abs(position[2]) > roomHalfLength - halfDepth

    if (isOutsideBounds) {
      // Clamp position to new room boundaries
      const clampedX = Math.max(-roomHalfWidth + halfWidth, Math.min(roomHalfWidth - halfWidth, position[0]))
      const clampedZ = Math.max(-roomHalfLength + halfDepth, Math.min(roomHalfLength - halfDepth, position[2]))

      // Update position if needed
      if (clampedX !== position[0] || clampedZ !== position[2]) {
        onDrag([clampedX, position[1], clampedZ])
      }
    }
  }, [room.width, room.length, position, halfWidth, halfDepth, onDrag, scale, rotation])

  // Render appropriate furniture model
  const renderFurniture = () => {
    switch (type) {
      case FurnitureType.SOFA:
        return <Sofa color={color} />
      case FurnitureType.ARMCHAIR:
        return <Armchair color={color} />
      case FurnitureType.COFFEE_TABLE:
        return <CoffeeTable color={color} />
      case FurnitureType.TV_STAND:
        return <TvStand color={color} />
      case FurnitureType.PLANT:
        return <Plant color={color} />
      case FurnitureType.LAMP:
        return <Lamp color={color} />
      default:
        return <mesh />
    }
  }

  return (
    <group
      position={position}
      rotation={rotation as any}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerMissed={(e) => {
        if (e.type === "click") onSelect()
      }}
    >
      <group ref={ref}>
        {renderFurniture()}
        {isSelected && (
          <mesh position={[0, 0.01, 0]}>
            <circleGeometry args={[1.2, 32]} />
            <meshBasicMaterial color="#4285F4" opacity={0.3} transparent />
          </mesh>
        )}
      </group>
    </group>
  )
}