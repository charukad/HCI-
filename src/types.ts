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
  wallColor: "#F5F5F5", // Lighter wall color similar to reference
  floorColor: "#E0E0E0", // Light gray floor like in reference
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
  // First sofa (similar to chair type)
  {
    id: "1",
    type: FurnitureType.CHAIR,
    position: [-2.5, 0, 2.5],
    rotation: [0, Math.PI / 2, 0], // Facing center
    scale: [1.5, 1, 1.5],
    color: "#C2813B", // Brown leather like in reference
  },
  // Second sofa (similar to chair type)
  {
    id: "2",
    type: FurnitureType.CHAIR,
    position: [2, 0, 2],
    rotation: [0, Math.PI, 0], // Facing center
    scale: [1.5, 1, 1.5],
    color: "#6B8E23", // Olive green like in reference
  },
  // Coffee table (using dining table type)
  {
    id: "3",
    type: FurnitureType.DINING_TABLE,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 0.5, 1],
    color: "#F0D9B5", // Light wood color
  },
  // TV cabinet (using side table type)
  {
    id: "4",
    type: FurnitureType.SIDE_TABLE,
    position: [0, 0, -3],
    rotation: [0, 0, 0],
    scale: [1.2, 1.2, 1.2],
    color: "#E0C8A0", // Light wood color for TV cabinet
  },
]