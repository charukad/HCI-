// src/components/TvStand.tsx
import * as THREE from "three"

interface TvStandProps {
  color: string
}

export default function TvStand({ color }: TvStandProps) {
  // Create material once and reuse
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.4,
    metalness: 0.3
  })
  
  // Create glass material for TV screen
  const screenMaterial = new THREE.MeshStandardMaterial({ 
    color: "#111111",  // Almost black
    roughness: 0.1,
    metalness: 0.8,
    emissive: new THREE.Color("#111111"),
    emissiveIntensity: 0.1
  })

  return (
    <group>
      {/* Main cabinet */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 0.5]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* TV on top */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1.8, 0.05, 0.4]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* TV screen */}
      <mesh castShadow receiveShadow position={[0, 1.25, 0]}>
        <boxGeometry args={[1.6, 0.8, 0.1]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>

      {/* Drawer fronts */}
      <mesh castShadow receiveShadow position={[-0.5, 0.3, 0.26]}>
        <boxGeometry args={[0.9, 0.4, 0.02]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0.5, 0.3, 0.26]}>
        <boxGeometry args={[0.9, 0.4, 0.02]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Drawer handles */}
      <mesh castShadow receiveShadow position={[-0.5, 0.3, 0.28]}>
        <boxGeometry args={[0.4, 0.03, 0.03]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0.5, 0.3, 0.28]}>
        <boxGeometry args={[0.4, 0.03, 0.03]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}