"use client"

import { createContext, useState, useContext, type ReactNode } from "react"
import {
  type FurnitureItem,
  type Room,
  type SavedDesign,
  type Snapshot,
  type Wall,
  initialFurniture,
  initialRoom,
  WorkflowStep,
} from "../types"

interface FurnitureContextType {
  furniture: FurnitureItem[]
  room: Room
  selectedId: string | null
  savedDesigns: SavedDesign[]
  snapshots: Snapshot[]
  workflowStep: WorkflowStep
  setWorkflowStep: (step: WorkflowStep) => void
  setRoom: (room: Room) => void
  setSelectedId: (id: string | null) => void
  updateFurniturePosition: (id: string, position: [number, number, number]) => void
  updateFurnitureRotation: (id: string, rotation: [number, number, number]) => void
  updateFurnitureScale: (id: string, scale: [number, number, number]) => void
  updateFurnitureColor: (id: string, color: string) => void
  addFurniture: (type: string) => string
  removeFurniture: (id: string) => void
  saveDesign: (name: string) => void
  captureSnapshot: (imageData: string) => string
  addWall: (start: { x: number; y: number }, end: { x: number; y: number }) => string
  updateWall: (id: string, start: { x: number; y: number }, end: { x: number; y: number }) => void
  removeWall: (id: string) => void
}

interface FurnitureProviderProps {
  children: ReactNode
}

const FurnitureContext = createContext<FurnitureContextType | undefined>(undefined)

export function FurnitureProvider({ children }: FurnitureProviderProps) {
  const [furniture, setFurniture] = useState<FurnitureItem[]>(initialFurniture)
  const [room, setRoom] = useState<Room>(initialRoom)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>(WorkflowStep.RoomDesign2D)

  const updateFurniturePosition = (id: string, position: [number, number, number]) => {
    setFurniture((prev) => prev.map((item) => (item.id === id ? { ...item, position } : item)))
  }

  const updateFurnitureRotation = (id: string, rotation: [number, number, number]) => {
    setFurniture((prev) => prev.map((item) => (item.id === id ? { ...item, rotation } : item)))
  }

  const updateFurnitureScale = (id: string, scale: [number, number, number]) => {
    setFurniture((prev) => prev.map((item) => (item.id === id ? { ...item, scale } : item)))
  }

  const updateFurnitureColor = (id: string, color: string) => {
    setFurniture((prev) => prev.map((item) => (item.id === id ? { ...item, color } : item)))
  }

  const addFurniture = (type: string) => {
    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      type: type as any,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#A0522D",
    }
    setFurniture([...furniture, newItem])
    return newItem.id
  }

  const removeFurniture = (id: string) => {
    setFurniture((prev) => prev.filter((item) => item.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const saveDesign = (name: string) => {
    const newDesign: SavedDesign = {
      id: Date.now().toString(),
      name,
      furniture: [...furniture],
      room: { ...room },
    }
    setSavedDesigns([...savedDesigns, newDesign])
  }

  const captureSnapshot = (imageData: string) => {
    const newSnapshot: Snapshot = {
      id: Date.now().toString(),
      imageData,
      timestamp: new Date().toISOString(),
      designState: {
        furniture: [...furniture],
        room: { ...room },
      },
    }
    setSnapshots((prev) => [newSnapshot, ...prev])
    return newSnapshot.id
  }

  const setRoomWithValidation = (newRoom: Room) => {
    // Ensure dimensions are within reasonable limits
    const validatedRoom = {
      ...newRoom,
      width: Math.max(1, Math.min(20, newRoom.width)),
      length: Math.max(1, Math.min(20, newRoom.length)),
      height: Math.max(1, Math.min(5, newRoom.height)),
    }
    setRoom(validatedRoom)
  }

  // Wall management functions for 2D room design
  const addWall = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const newWall: Wall = {
      id: Date.now().toString(),
      start,
      end,
    }

    setRoom((prevRoom) => ({
      ...prevRoom,
      walls: [...prevRoom.walls, newWall],
    }))

    return newWall.id
  }

  const updateWall = (id: string, start: { x: number; y: number }, end: { x: number; y: number }) => {
    setRoom((prevRoom) => ({
      ...prevRoom,
      walls: prevRoom.walls.map((wall) => (wall.id === id ? { ...wall, start, end } : wall)),
    }))
  }

  const removeWall = (id: string) => {
    setRoom((prevRoom) => ({
      ...prevRoom,
      walls: prevRoom.walls.filter((wall) => wall.id !== id),
    }))
  }

  return (
    <FurnitureContext.Provider
      value={{
        furniture,
        room,
        selectedId,
        savedDesigns,
        snapshots,
        workflowStep,
        setWorkflowStep,
        setRoom: setRoomWithValidation,
        setSelectedId,
        updateFurniturePosition,
        updateFurnitureRotation,
        updateFurnitureScale,
        updateFurnitureColor,
        addFurniture,
        removeFurniture,
        saveDesign,
        captureSnapshot,
        addWall,
        updateWall,
        removeWall,
      }}
    >
      {children}
    </FurnitureContext.Provider>
  )
}

export const useFurniture = (): FurnitureContextType => {
  const context = useContext(FurnitureContext)
  if (context === undefined) {
    throw new Error("useFurniture must be used within a FurnitureProvider")
  }
  return context
}

