import * as THREE from "three"

interface PlantProps {
  color: string
}

export default function Plant({ color }: PlantProps) {
  // Create pot material
  const potMaterial = new THREE.MeshStandardMaterial({ 
    color: "#A67C52", // Terracotta color
    roughness: 0.8,
    metalness: 0.1
  })
  
  // Create foliage material
  const foliageMaterial = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.9,
    metalness: 0
  })

  return (
    <group>
      {/* Plant pot */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 16]} />
        <primitive object={potMaterial} attach="material" />
      </mesh>

      {/* Plant base */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={foliageMaterial} attach="material" />
      </mesh>

      {/* Plant leaves - several overlapping shapes */}
      {[...Array(8)].map((_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
          <mesh 
            castShadow 
            receiveShadow 
            position={[0.1, 0.45, 0]} 
            rotation={[Math.random() * 0.3, 0, Math.random() * 0.4 - 0.2]}
          >
            <sphereGeometry args={[0.18, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive object={foliageMaterial} attach="material" />
          </mesh>
        </group>
      ))}
      
      {/* Taller center leaves */}
      {[...Array(3)].map((_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <mesh 
            castShadow 
            receiveShadow 
            position={[0, 0.7, 0]} 
            rotation={[Math.random() * 0.1 + 0.1, 0, Math.random() * 0.2 - 0.1]}
          >
            <coneGeometry args={[0.12, 0.4, 8]} />
            <primitive object={foliageMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  )
}