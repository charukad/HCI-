import * as THREE from "three"

interface CoffeeTableProps {
  color: string
}

export default function CoffeeTable({ color }: CoffeeTableProps) {
  // Create material once and reuse
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.5,
    metalness: 0.1
  })
  
  // Create dark material for legs
  const legMaterial = new THREE.MeshStandardMaterial({ 
    color: "#3A2618",  // Dark brown for legs
    roughness: 0.7,
    metalness: 0.2
  })

  return (
    <group>
      {/* Tabletop - rounded rectangle shape */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Lower shelf */}
      <mesh castShadow receiveShadow position={[0, 0.10, 0]}>
        <boxGeometry args={[1.0, 0.02, 0.6]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Legs (4) */}
      {[
        [-0.55, 0.125, 0.3],
        [0.55, 0.125, 0.3],
        [-0.55, 0.125, -0.3],
        [0.55, 0.125, -0.3],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.25]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  )
}