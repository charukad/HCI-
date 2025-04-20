import * as THREE from "three"

interface BedProps {
  color: string
}

export default function Bed({ color }: BedProps) {
  // Bed frame material
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: "#5D4037", // Dark wood
    roughness: 0.7,
    metalness: 0.1
  })
  
  // Mattress and bedding material
  const mattressMaterial = new THREE.MeshStandardMaterial({ 
    color: "#F5F5F5", // White
    roughness: 0.9,
    metalness: 0
  })
  
  // Bedding/duvet material
  const beddingMaterial = new THREE.MeshStandardMaterial({ 
    color: color, // From props
    roughness: 0.9,
    metalness: 0
  })

  return (
    <group>
      {/* Bed frame */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[2, 0.4, 3]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* Mattress */}
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.9, 0.3, 2.9]} />
        <primitive object={mattressMaterial} attach="material" />
      </mesh>
      
      {/* Headboard */}
      <mesh castShadow receiveShadow position={[0, 1.1, -1.4]}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* Duvet/blanket */}
      <mesh castShadow receiveShadow position={[0, 0.75, 0.3]}>
        <boxGeometry args={[1.85, 0.1, 2.3]} />
        <primitive object={beddingMaterial} attach="material" />
      </mesh>
      
      {/* Folded part of duvet */}
      <mesh castShadow receiveShadow position={[0, 0.75, 1.4]}>
        <boxGeometry args={[1.85, 0.15, 0.3]} />
        <primitive object={beddingMaterial} attach="material" />
      </mesh>
      
      {/* Pillows */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} castShadow receiveShadow position={[x, 0.85, -1]}>
          <boxGeometry args={[0.8, 0.2, 0.5]} />
          <meshStandardMaterial color="#F5F5F5" />
        </mesh>
      ))}
    </group>
  )
}