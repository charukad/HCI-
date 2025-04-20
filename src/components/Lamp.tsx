import * as THREE from "three"

interface LampProps {
  color: string
}

export default function Lamp({ color }: LampProps) {
  // Create base and stand material
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.4,
    metalness: 0.6
  })
  
  // Create lampshade material
  const shadeMaterial = new THREE.MeshStandardMaterial({ 
    color: "#F5F5F5", // Light cream color for shade
    roughness: 0.9,
    metalness: 0.1,
    emissive: new THREE.Color("#F9F2D6"),
    emissiveIntensity: 0.3
  })

  return (
    <group>
      {/* Lamp base */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
        <primitive object={baseMaterial} attach="material" />
      </mesh>

      {/* Lamp pole */}
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <primitive object={baseMaterial} attach="material" />
      </mesh>

      {/* Connection to lampshade */}
      <mesh castShadow receiveShadow position={[0, 1.45, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <primitive object={baseMaterial} attach="material" />
      </mesh>

      {/* Lampshade */}
      <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.3, 16, 1, true]} />
        <primitive object={shadeMaterial} attach="material" />
      </mesh>
      
      {/* Top cover of lampshade */}
      <mesh receiveShadow position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.01, 16]} />
        <primitive object={shadeMaterial} attach="material" />
      </mesh>
      
      {/* Add a point light to simulate the lamp's light */}
      <pointLight 
        position={[0, 1.6, 0]} 
        intensity={0.5} 
        color="#FFF5E0" 
        distance={3} 
        decay={2}
      />
    </group>
  )
}