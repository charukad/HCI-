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
  FurnitureType,
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
  updateFurnitureMaterial: (id: string, materialType: string) => void
  updateFurnitureTexture: (id: string, texture: string) => void
  updateFurnitureFinish: (id: string, finish: string) => void
  updateLampIntensity: (id: string, intensity: number) => void
  updateLampColor: (id: string, color: string) => void
  applyRoomPreset: (preset: string) => void
  applyColorScheme: (scheme: string, colors: string[]) => void
  addFurniture: (type: string) => string
  removeFurniture: (id: string) => void
  saveDesign: (name: string) => void
  captureSnapshot: (imageData: string) => string
  addWall: (start: { x: number; y: number }, end: { x: number; y: number }) => string
  updateWall: (id: string, start: { x: number; y: number }, end: { x: number; y: number }) => void
  removeWall: (id: string) => void
  importCustomModel: (modelUrl: string, modelName: string, dimensions?: { width: number, depth: number, height: number }) => string
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

  const updateFurnitureMaterial = (id: string, materialType: string) => {
    setFurniture((prev) => 
      prev.map((item) => item.id === id ? { ...item, materialType } : item)
    );
  };

  const updateFurnitureTexture = (id: string, texture: string) => {
    setFurniture((prev) => 
      prev.map((item) => item.id === id ? { ...item, texture } : item)
    );
  };

  const updateFurnitureFinish = (id: string, finish: string) => {
    setFurniture((prev) => 
      prev.map((item) => item.id === id ? { ...item, finish } : item)
    );
  };

  const updateLampIntensity = (id: string, intensity: number) => {
    setFurniture((prev) => 
      prev.map((item) => item.id === id ? { ...item, lightIntensity: intensity } : item)
    );
  };

  const updateLampColor = (id: string, color: string) => {
    setFurniture((prev) => 
      prev.map((item) => item.id === id ? { ...item, lightColor: color } : item)
    );
  };

  const applyRoomPreset = (preset: string) => {
    // Define various room presets
    const presets: {[key: string]: Partial<Room>} = {
      'living-room': {
        width: 10,
        length: 8,
        height: 3,
        wallColor: "#F5F5F5",
        floorColor: "#D2B48C",
        ambientLightIntensity: 0.6,
        mainLightColor: "#FFFFFF",
        timeOfDay: 'day' as const
      },
      'bedroom': {
        width: 8,
        length: 10,
        height: 2.8,
        wallColor: "#E0F2F1",
        floorColor: "#8D6E63",
        ambientLightIntensity: 0.4,
        mainLightColor: "#FFD6AA",
        timeOfDay: 'evening' as const
      },
      'office': {
        width: 7,
        length: 6,
        height: 2.8,
        wallColor: "#ECEFF1",
        floorColor: "#455A64",
        ambientLightIntensity: 0.7,
        mainLightColor: "#FFFFFF",
        timeOfDay: 'day' as const
      },
      // Add more presets as needed
    };
    
    if (presets[preset]) {
      setRoom({
        ...room,
        ...presets[preset]
      });
      
      // Could also set furniture based on preset
      // For example, load predefined furniture for a bedroom
    }
  };

  // Apply color schemes to the room and furniture
  const applyColorScheme = (scheme: string, colors: string[]) => {
    // Update room colors
    setRoom({
      ...room,
      wallColor: colors[0],
      floorColor: colors[3],
    });
    
    // Update furniture colors based on type
    setFurniture((prev) => 
      prev.map(item => {
        // Assign different colors based on furniture type
        let color = colors[1]; // Default
        
        if (item.type === FurnitureType.SOFA || item.type === FurnitureType.ARMCHAIR) {
          color = colors[2];
        } else if (item.type === FurnitureType.COFFEE_TABLE || item.type === FurnitureType.TV_STAND) {
          color = colors[1];
        } else if (item.type === FurnitureType.PLANT) {
          color = "#2E7D32"; // Keep plants green
        }
        
        return { ...item, color };
      })
    );
  };

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

  // Import custom 3D model
  const importCustomModel = (modelUrl: string, modelName: string, dimensions?: { width: number, depth: number, height: number }) => {
    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      type: FurnitureType.CUSTOM_MODEL,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#CCCCCC", // Default gray color for imported models
      modelUrl,
      modelName,
      customDimensions: dimensions || { width: 1.0, depth: 1.0, height: 1.0 }
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
    const newWall = {
      id: Date.now().toString(),
      start,
      end,
    }
    
    setRoom((prev) => ({
      ...prev,
      walls: [...prev.walls, newWall],
    }))
    
    return newWall.id
  }

  const updateWall = (id: string, start: { x: number; y: number }, end: { x: number; y: number }) => {
    setRoom((prev) => ({
      ...prev,
      walls: prev.walls.map((wall) => 
        wall.id === id ? { ...wall, start, end } : wall
      ),
    }))
  }

  const removeWall = (id: string) => {
    setRoom((prev) => ({
      ...prev,
      walls: prev.walls.filter((wall) => wall.id !== id),
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
        updateFurnitureMaterial,
        updateFurnitureTexture,
        updateFurnitureFinish,
        updateLampIntensity,
        updateLampColor,
        applyRoomPreset,
        applyColorScheme,
        addFurniture,
        removeFurniture,
        saveDesign,
        captureSnapshot,
        addWall,
        updateWall,
        removeWall,
        importCustomModel, // Added new function
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