import * as THREE from "three"

interface RugProps {
  color: string
  pattern?: string
}

export default function Rug({ color, pattern = 'solid' }: RugProps) {
  // Create rug materials
  const createRugMaterial = () => {
    // Base material
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide
    })
    
    // For patterns, we could create a texture or use a more complex approach
    // This is a simple implementation
    if (pattern === 'striped') {
      // Alternate color for stripes
      const altColor = new THREE.Color(color).offsetHSL(0, 0, 0.2);
      material.color = altColor;
    }
    
    return material;
  }

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      {/* Main rug - slightly raised from floor */}
      <mesh receiveShadow>
        <planeGeometry args={[3, 2]} />
        <primitive object={createRugMaterial()} attach="material" />
      </mesh>
      
      {/* Border */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[1.4, 1.5, 32]} />
        <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, 0.1, -0.1)} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Pattern elements - basic implementation */}
      {pattern === 'geometric' && (
        Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 0, 0.002]} rotation={[0, 0, (Math.PI * i) / 5]}>
            <ringGeometry args={[0.5 + i * 0.2, 0.55 + i * 0.2, 32]} />
            <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, 0, i % 2 ? 0.2 : -0.2)} side={THREE.DoubleSide} />
          </mesh>
        ))
      )}
    </group>
  )
}