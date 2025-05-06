import { useRef } from "react"
import { useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

interface CustomModelProps {
  url: string
  color?: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export default function CustomModel({ url, color, position, rotation, scale }: CustomModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(url)
  const { gl } = useThree()
  
  // Clone the scene to avoid modifying the cached original
  const modelScene = scene.clone()
  
  // Apply color to all materials in the model if color prop is provided
  if (color) {
    modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Check if the material is an array
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => {
            const newMat = mat.clone()
            newMat.color = new THREE.Color(color)
            return newMat
          })
        } else if (child.material) {
          // Clone the material to avoid modifying the cached original
          const newMaterial = child.material.clone()
          newMaterial.color = new THREE.Color(color)
          child.material = newMaterial
        }
      }
    })
  }
  
  // Set up shadows for all meshes in the model
  modelScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  // Preload this model for future use
  useGLTF.preload(url)

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation as any} 
      scale={scale}
    >
      <primitive object={modelScene} />
    </group>
  )
}