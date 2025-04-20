import * as THREE from "three"

interface BookshelfProps {
  color: string
}

export default function Bookshelf({ color }: BookshelfProps) {
  // Main shelf material
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.7,
    metalness: 0.1
  })
  
  // Books and decorations with varied colors
  const colors = ["#A52A2A", "#4682B4", "#228B22", "#8B4513", "#4B0082", "#696969"]
  
  return (
    <group>
      {/* Main bookshelf frame */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[1.2, 2.4, 0.4]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Shelves (horizontal dividers) */}
      {[0.4, 0.9, 1.4, 1.9].map((y, i) => (
        <mesh key={`shelf-${i}`} castShadow receiveShadow position={[0, y, 0]}>
          <boxGeometry args={[1.1, 0.03, 0.35]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
      
      {/* Vertical divider */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[0.03, 2.3, 0.35]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Add books on shelves */}
      {[
        // Each shelf has different books
        [[-0.4, 0.2, 0], [-0.25, 0.2, 0], [-0.1, 0.2, 0], [0.2, 0.2, 0], [0.4, 0.2, 0]],
        [[-0.35, 0.65, 0], [-0.15, 0.65, 0], [0.15, 0.65, 0], [0.35, 0.65, 0]],
        [[-0.4, 1.15, 0], [-0.2, 1.15, 0], [0.1, 1.15, 0], [0.35, 1.15, 0]],
        [[-0.35, 1.65, 0], [-0.1, 1.65, 0], [0.25, 1.65, 0], [0.4, 1.65, 0]],
        [[-0.3, 2.15, 0], [-0.1, 2.15, 0], [0.2, 2.15, 0], [0.4, 2.15, 0]]
      ].map((shelf, shelfIndex) => (
        shelf.map((position, i) => (
          <mesh 
            key={`book-${shelfIndex}-${i}`} 
            castShadow 
            receiveShadow 
            position={position} 
            rotation={[0, 0, 0]}
          >
            <boxGeometry args={[0.08, 0.25, 0.2]} />
            <meshStandardMaterial color={colors[Math.floor(Math.random() * colors.length)]} />
          </mesh>
        ))
      ))}
      
      {/* Add decorative items */}
      <mesh castShadow receiveShadow position={[0.3, 0.65, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ADD8E6" />
      </mesh>
      
      <mesh castShadow receiveShadow position={[-0.25, 1.65, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  )
}