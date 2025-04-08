export enum ViewMode {
  ThreeD = "3D",
  TopDown = "Top Down",
}

export enum WorkflowStep {
  RoomDesign2D = "2D Room Design",
  RoomView3D = "3D Room View",
  FurnitureArrangement = "Furniture Arrangement",
}

export enum FurnitureType {
  CHAIR = "chair",
  DINING_TABLE = "dining_table",
  SIDE_TABLE = "side_table",
}

export interface Point {
  x: number
  y: number
}

export interface Wall {
  id: string
  start: Point
  end: Point
}

export interface TextureInfo {
  url: string | null
  repeat: [number, number]
}

export interface FurnitureItem {
  id: string
  type: FurnitureType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
}

export interface Room {
  width: number
  length: number
  height: number
  wallColor: string
  floorColor: string
  wallTexture: TextureInfo
  floorTexture: TextureInfo
  walls: Wall[] // For custom room shapes
}

export interface SavedDesign {
  id: string
  name: string
  furniture: FurnitureItem[]
  room: Room
}

export interface Snapshot {
  id: string
  imageData: string
  timestamp: string
  designState: {
    furniture: FurnitureItem[]
    room: Room
  }
}

export const initialRoom: Room = {
  width: 10,
  length: 10,
  height: 3,
  wallColor: "#FFFFFF",
  floorColor: "#F0F0F0",
  wallTexture: {
    url: null,
    repeat: [4, 2],
  },
  floorTexture: {
    url: null,
    repeat: [4, 4],
  },
  walls: [], // Empty for now, will be populated in 2D design
}

export const initialFurniture: FurnitureItem[] = [
  {
    id: "1",
    type: FurnitureType.CHAIR,
    position: [-2, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#A0522D",
  },
  {
    id: "2",
    type: FurnitureType.DINING_TABLE,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#8B4513",
  },
  {
    id: "3",
    type: FurnitureType.SIDE_TABLE,
    position: [2, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#D2691E",
  },
]

