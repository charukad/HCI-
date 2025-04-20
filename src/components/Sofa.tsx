import * as THREE from "three"

interface SofaProps {
  color: string
}

export default function Sofa({ color }: SofaProps) {
  // Create material once and reuse
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.8,
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
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[2.2, 0.6, 1]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Back cushion */}
      <mesh castShadow receiveShadow position={[0, 0.7, -0.4]}>
        <boxGeometry args={[2.2, 0.8, 0.2]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Seat cushions (2) */}
      <mesh castShadow receiveShadow position={[-0.55, 0.7, 0.1]}>
        <boxGeometry args={[1, 0.2, 0.8]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0.55, 0.7, 0.1]}>
        <boxGeometry args={[1, 0.2, 0.8]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Armrests */}
      <mesh castShadow receiveShadow position={[-1.05, 0.7, -0.1]}>
        <boxGeometry args={[0.15, 0.35, 0.8]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      <mesh castShadow receiveShadow position={[1.05, 0.7, -0.1]}>
        <boxGeometry args={[0.15, 0.35, 0.8]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Legs (4) */}
      {[
        [-1, 0.15, 0.4],
        [1, 0.15, 0.4],
        [-1, 0.15, -0.4],
        [1, 0.15, -0.4],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  )
}