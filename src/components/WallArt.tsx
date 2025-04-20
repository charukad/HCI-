import * as THREE from "three"

interface WallArtProps {
  color: string
  style?: 'abstract' | 'landscape' | 'portrait' | 'minimalist'
}

export default function WallArt({ color, style = 'abstract' }: WallArtProps) {
  // Frame material
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: '#4A3C2A', // Dark wood frame
    roughness: 0.7,
    metalness: 0.2
  })
  
  // Canvas/artwork material
  const artMaterial = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.9,
    metalness: 0
  })

  return (
    <group rotation={[0, 0, 0]} position={[0, 1.5, -0.05]}>
      {/* Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.9, 0.05]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* Artwork canvas */}
      <mesh position={[0, 0, 0.03]} castShadow>
        <boxGeometry args={[1.1, 0.8, 0.01]} />
        <primitive object={artMaterial} attach="material" />
      </mesh>
      
      {/* Create different art styles */}
      {style === 'abstract' && (
        <>
          <mesh position={[0.25, 0.2, 0.035]} castShadow>
            <circleGeometry args={[0.2, 32]} />
            <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0.2, 0, 0)} />
          </mesh>
          <mesh position={[-0.3, -0.1, 0.035]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.01]} />
            <meshStandardMaterial color={new THREE.Color(color).offsetHSL(-0.2, 0, 0)} />
          </mesh>
        </>
      )}
      
      {style === 'landscape' && (
        <>
          {/* Simple landscape - horizon line, mountains, etc. */}
          <mesh position={[0, -0.1, 0.035]} castShadow>
            <planeGeometry args={[1.05, 0.4]} />
            <meshStandardMaterial color="#5B8C5A" /> {/* Ground */}
          </mesh>
          <mesh position={[0, 0.25, 0.035]} castShadow>
            <planeGeometry args={[1.05, 0.3]} />
            <meshStandardMaterial color="#87CEEB" /> {/* Sky */}
          </mesh>
          
          {/* Mountains */}
          <mesh position={[-0.3, 0.1, 0.036]} castShadow>
            <coneGeometry args={[0.15, 0.3, 4]} rotation={[0, Math.PI/4, 0]} />
            <meshStandardMaterial color="#6B8E23" />
          </mesh>
          <mesh position={[0.2, 0.05, 0.036]} castShadow>
            <coneGeometry args={[0.2, 0.35, 4]} rotation={[0, Math.PI/4, 0]} />
            <meshStandardMaterial color="#556B2F" />
          </mesh>
        </>
      )}
    </group>
  )
}