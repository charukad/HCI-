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
  SOFA = "sofa",
  ARMCHAIR = "armchair",
  COFFEE_TABLE = "coffee_table",
  TV_STAND = "tv_stand",
  PLANT = "plant",
  LAMP = "lamp",
  BOOKSHELF = "bookshelf",
  RUG = "rug",
  WALL_ART = "wall_art",
  DINING_TABLE = "dining_table",
  DINING_CHAIR = "dining_chair",
  DESK = "desk",
  OFFICE_CHAIR = "office_chair",
  BED = "bed",
  NIGHTSTAND = "nightstand",
  PENDANT_LIGHT = "pendant_light",
  CUSTOM_MODEL = "custom_model" // Added custom model type
}

export enum MaterialType {
  FABRIC = "fabric",
  WOOD = "wood",
  METAL = "metal",
  GLASS = "glass",
  LEATHER = "leather",
  PLASTIC = "plastic"
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

// Add an interface for furniture dimensions
export interface FurnitureDimension {
  width: number
  depth: number
  height?: number
}

export interface FurnitureItem {
  id: string
  type: FurnitureType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  materialType?: string
  texture?: string
  finish?: string
  lightIntensity?: number
  lightColor?: string
  modelUrl?: string // Add URL for custom models
  modelName?: string // Add name for custom models
  customDimensions?: { width: number, depth: number, height: number } // Add custom dimensions for proper boundary calculation
}

export interface Room {
  width: number
  length: number
  height: number
  wallColor: string
  floorColor: string
  wallTexture: TextureInfo
  floorTexture: TextureInfo
  walls: Wall[]
  ambientLightIntensity: number
  mainLightColor: string
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
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
  floorColor: "#CCCCCC",
  wallTexture: {
    url: null,
    repeat: [4, 2],
  },
  floorTexture: {
    url: null,
    repeat: [4, 4],
  },
  walls: [],
  ambientLightIntensity: 0.5,
  mainLightColor: "#FFFFFF",
  timeOfDay: 'day'
}

// Default furniture dimensions including custom models
export const FURNITURE_DIMENSIONS: Record<FurnitureType, FurnitureDimension> = {
  [FurnitureType.SOFA]: { width: 2.2, depth: 1.0 },
  [FurnitureType.ARMCHAIR]: { width: 1.1, depth: 1.0 },
  [FurnitureType.COFFEE_TABLE]: { width: 1.2, depth: 0.7 },
  [FurnitureType.TV_STAND]: { width: 2.0, depth: 0.5 },
  [FurnitureType.PLANT]: { width: 0.4, depth: 0.4 },
  [FurnitureType.LAMP]: { width: 0.5, depth: 0.5 },
  [FurnitureType.BOOKSHELF]: { width: 1.2, depth: 0.4 },
  [FurnitureType.RUG]: { width: 3.0, depth: 2.0 },
  [FurnitureType.WALL_ART]: { width: 1.2, depth: 0.1 },
  [FurnitureType.DINING_TABLE]: { width: 1.8, depth: 1.8 },
  [FurnitureType.DINING_CHAIR]: { width: 0.8, depth: 0.8 },
  [FurnitureType.DESK]: { width: 1.6, depth: 0.8 },
  [FurnitureType.OFFICE_CHAIR]: { width: 0.7, depth: 0.7 },
  [FurnitureType.BED]: { width: 2.0, depth: 3.0 },
  [FurnitureType.NIGHTSTAND]: { width: 0.5, depth: 0.5 },
  [FurnitureType.PENDANT_LIGHT]: { width: 0.4, depth: 0.4 },
  [FurnitureType.CUSTOM_MODEL]: { width: 1.0, depth: 1.0 }, // Default size for custom models
}

// Initial furniture that matches the image
export const initialFurniture: FurnitureItem[] = [
  // Two sofas
  {
    id: "1",
    type: FurnitureType.SOFA,
    position: [-2, 0, 1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#C69C6D",  // Tan/brown color
    materialType: "fabric"
  },
  {
    id: "2",
    type: FurnitureType.SOFA,
    position: [2, 0, 1],
    rotation: [0, Math.PI, 0],
    scale: [1, 1, 1],
    color: "#C69C6D",  // Tan/brown color
    materialType: "fabric"
  },
  // Green armchair
  {
    id: "3",
    type: FurnitureType.ARMCHAIR,
    position: [4, 0, -2],
    rotation: [0, -Math.PI/2, 0],
    scale: [1, 1, 1],
    color: "#5B8C5A",  // Olive green
    materialType: "fabric"
  },
  // Coffee tables
  {
    id: "4",
    type: FurnitureType.COFFEE_TABLE,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#A0825B",  // Light wood
    materialType: "wood"
  },
  {
    id: "5",
    type: FurnitureType.COFFEE_TABLE,
    position: [2, 0, -1],
    rotation: [0, 0, 0],
    scale: [0.8, 0.8, 0.8],
    color: "#A0825B",  // Light wood
    materialType: "wood"
  },
  // TV Stand
  {
    id: "6",
    type: FurnitureType.TV_STAND,
    position: [0, 0, -4],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#333333",  // Dark gray/black
    materialType: "wood"
  },
  // Plants for decoration
  {
    id: "7",
    type: FurnitureType.PLANT,
    position: [4.5, 0, 3],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#2E7D32",  // Green
  },
  {
    id: "8",
    type: FurnitureType.PLANT,
    position: [-3, 0, -4],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#2E7D32",  // Green
  },
  // Floor lamp
  {
    id: "9",
    type: FurnitureType.LAMP,
    position: [-4, 0, -2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#212121",  // Black
    lightIntensity: 0.5,
    lightColor: "#FFF5E0",
    materialType: "metal"
  },
  // Bookshelf
  {
    id: "10",
    type: FurnitureType.BOOKSHELF,
    position: [-4.5, 0, -4],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#8B4513",  // Brown
    materialType: "wood"
  },
  // Rug
  {
    id: "11",
    type: FurnitureType.RUG,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1.5, 1, 1.5],
    color: "#B0C4DE",  // Light steel blue
    texture: "geometric"
  },
  // Wall art
  {
    id: "12",
    type: FurnitureType.WALL_ART,
    position: [0, 1.5, -4.9],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#FFD700",  // Gold
    texture: "abstract"
  },
]