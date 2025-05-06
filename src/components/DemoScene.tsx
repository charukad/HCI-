import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import Sofa from "./Sofa"
import Armchair from "./Armchair"
import CoffeeTable from "./CoffeeTable"
import TvStand from "./TvStand"
import Plant from "./Plant"
import Lamp from "./Lamp"
import Bookshelf from "./Bookshelf"
import Rug from "./Rug"
import WallArt from "./WallArt"
import Bed from "./Bed"

interface DemoSceneProps {
  furnitureType: string
  color: string
}

export default function DemoScene({ furnitureType, color }: DemoSceneProps) {
  const [rotating, setRotating] = useState(true)

  const renderFurniture = () => {
    switch (furnitureType) {
      case "sofa":
        return <Sofa color={color} />
      case "armchair":
        return <Armchair color={color} />
      case "coffee_table":
        return <CoffeeTable color={color} />
      case "tv_stand":
        return <TvStand color={color} />
      case "plant":
        return <Plant color={color} />
      case "lamp":
        return <Lamp color={color} />
      case "bookshelf":
        return <Bookshelf color={color} />
      case "rug":
        return <Rug color={color} pattern="simple" />
      case "wall_art":
        return <WallArt color={color} style="abstract" />
      case "bed":
        return <Bed color={color} />
      default:
        return <Sofa color={color} />
    }
  }

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "200px" }}>
      <Canvas shadows>
        <color attach="background" args={["#f0f0f0"]} />
        <PerspectiveCamera makeDefault position={[3, 2, 3]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow color="#ffffff" />
        <group rotation={[0, rotating ? performance.now() * 0.0005 : 0, 0]}>
          {renderFurniture()}
        </group>
        <Environment preset="apartment" />
        <OrbitControls enablePan={false} enableZoom={true} autoRotate={rotating} autoRotateSpeed={1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </Canvas>
      <button 
        onClick={() => setRotating(!rotating)}
        style={{ 
          position: "absolute", 
          bottom: "10px", 
          right: "10px",
          background: "#4285F4",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        {rotating ? "Stop Rotation" : "Start Rotation"}
      </button>
    </div>
  )
}