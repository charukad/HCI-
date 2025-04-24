"use client"

import { useMemo, useEffect } from "react"
import * as THREE from "three"
import { useFurniture } from "../context/FurnitureContext"
import type { Point } from "../types"

interface RoomProps {
  width: number
  length: number
  height: number
  wallColor: string
  floorColor: string
  wallTexture: {
    url: string | null
    repeat: [number, number]
  }
  floorTexture: {
    url: string | null
    repeat: [number, number]
  }
}

// Define a type for the floor data to ensure proper typing
interface FloorData {
  customFloorGeometry: THREE.ShapeGeometry | THREE.PlaneGeometry
  floorCenter: [number, number, number]
}

export default function Room({ width, length, height, wallColor, floorColor, wallTexture, floorTexture }: RoomProps) {
  const { room } = useFurniture()
  const halfWidth = width / 2
  const halfLength = length / 2

  // Load textures if URLs are provided
  const [wallTextureMap, floorTextureMap] = useMemo(() => {
    let wallMap = null
    let floorMap = null

    if (wallTexture.url) {
      try {
        const texture = new THREE.TextureLoader().load(wallTexture.url)
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(wallTexture.repeat[0], wallTexture.repeat[1])
        wallMap = texture
      } catch (error) {
        console.error("Error loading wall texture:", error)
      }
    }

    if (floorTexture.url) {
      try {
        const texture = new THREE.TextureLoader().load(floorTexture.url)
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(floorTexture.repeat[0], floorTexture.repeat[1])
        floorMap = texture
      } catch (error) {
        console.error("Error loading floor texture:", error)
      }
    }

    return [wallMap, floorMap]
  }, [wallTexture.url, wallTexture.repeat, floorTexture.url, floorTexture.repeat])

  // Create materials
  const wallMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: wallColor,
      map: wallTextureMap,
    })
  }, [wallColor, wallTextureMap])

  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: floorColor,
      map: floorTextureMap,
      side: THREE.DoubleSide,
    })
  }, [floorColor, floorTextureMap])

  // Log when floor color changes
  useEffect(() => {
    console.log("Floor color changed to:", floorColor);
  }, [floorColor]);

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

  // Get ordered points of the room for floor creation
  const getOrderedRoomPoints = (): Point[] => {
    if (room.walls.length < 3) return []

    // If room is not closed, we can't create a proper floor
    if (!isRoomClosed()) return []

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

    // Follow connections to get ordered points in a consistent direction
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

  // Create custom floor geometry and calculate center
  const { customFloorGeometry, centerX, centerZ } = useMemo(() => {
    if (room.walls.length < 3) {
      // Default rectangular floor if no custom walls
      return {
        customFloorGeometry: new THREE.PlaneGeometry(width, length),
        centerX: 0,
        centerZ: 0
      }
    }

    const points = getOrderedRoomPoints()
    if (points.length < 3) {
      // Fallback to rectangular floor if can't create polygon
      return {
        customFloorGeometry: new THREE.PlaneGeometry(width, length),
        centerX: 0,
        centerZ: 0
      }
    }

    // Calculate the center of the floor polygon
    let centerX = 0;
    let centerY = 0;
    for (const point of points) {
      centerX += point.x;
      centerY += point.y;
    }
    centerX /= points.length;
    centerY /= points.length;

    // Create a shape from the points
    const shape = new THREE.Shape()

    // Don't reverse the points - use original order
    // Move to the first point
    shape.moveTo(points[0].x - centerX, points[0].y - centerY)

    // Add lines to all other points, centered around origin
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x - centerX, points[i].y - centerY)
    }

    // Close the shape by connecting back to the first point
    shape.lineTo(points[0].x - centerX, points[0].y - centerY)

    // Create geometry from shape
    const geometry = new THREE.ShapeGeometry(shape)
    
    return {
      customFloorGeometry: geometry,
      centerX,
      centerZ: centerY // Y in 2D becomes Z in 3D
    }
  }, [room.walls, width, length])

  // Generate 3D walls from 2D wall definitions
  const wallMeshes = useMemo(() => {
    if (room.walls.length === 0) {
      // If no custom walls defined, create a room with only back and right walls
      return (
        <>
          {/* Back wall (with windows) */}
          <mesh position={[0, height / 2, -halfLength]} receiveShadow>
            <boxGeometry args={[width, height, 0.1]} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>

          {/* Right wall (with door) */}
          <mesh position={[halfWidth, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <boxGeometry args={[length, height, 0.1]} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>
        </>
      )
    }

    // Create 3D walls from 2D wall definitions
    return room.walls.map((wall, index) => {
      // Calculate wall properties
      const startX = wall.start.x
      const startZ = wall.start.y // Y in 2D becomes Z in 3D
      const endX = wall.end.x
      const endZ = wall.end.y

      // Calculate wall center position
      const centerX = (startX + endX) / 2
      const centerZ = (startZ + endZ) / 2

      // Calculate wall length and rotation
      const dx = endX - startX
      const dz = endZ - startZ
      const wallLength = Math.sqrt(dx * dx + dz * dz)
      const wallRotation = Math.atan2(dz, dx)

      return (
        <mesh
          key={wall.id}
          position={[centerX, height / 2, centerZ]}
          rotation={[0, -wallRotation + Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.1, height, wallLength]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
      )
    })
  }, [room.walls, height, width, length, halfWidth, halfLength, wallMaterial])

  return (
    <group>
      {/* Default Floor for when custom walls aren't defined */}
      {room.walls.length === 0 && (
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial 
            color={floorColor} 
            map={floorTextureMap}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Custom Floor from walls */}
      {room.walls.length >= 3 && isRoomClosed() && (
        <mesh 
          rotation={[-Math.PI / 2, Math.PI, Math.PI]} 
          position={[centerX, 0, centerZ]} 
          receiveShadow
        >
          <primitive object={customFloorGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={floorColor} 
            map={floorTextureMap}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Walls */}
      {wallMeshes}

      {/* Floor boundary indicator */}
      {room.walls.length === 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[Math.min(width, length) / 2 - 0.1, Math.min(width, length) / 2, 64]} />
          <meshBasicMaterial color="#4285F4" opacity={0.2} transparent />
        </mesh>
      )}

      {/* Corner markers for rectangular room */}
      {room.walls.length === 0 &&
        [
          [halfWidth - 0.1, 0.01, halfLength - 0.1] as [number, number, number],
          [halfWidth - 0.1, 0.01, -halfLength + 0.1] as [number, number, number],
          [-halfWidth + 0.1, 0.01, halfLength - 0.1] as [number, number, number],
          [-halfWidth + 0.1, 0.01, -halfLength + 0.1] as [number, number, number],
        ].map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#4285F4" opacity={0.6} transparent />
          </mesh>
        ))}
    </group>
  )
}