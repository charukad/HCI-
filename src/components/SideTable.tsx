interface SideTableProps {
  color: string
}

export default function SideTable({ color }: SideTableProps) {
  // Use a lighter color for the TV cabinet
  const cabinetColor = "#e0c8a0"; // Light wooden color
  const screenColor = "#111111"; // Dark color for TV screen
  
  return (
    <group>
      {/* TV Cabinet */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.6, 0.5]} />
        <meshStandardMaterial color={cabinetColor} />
      </mesh>
      
      {/* TV Screen */}
      <mesh position={[0, 1.1, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.0, 0.1]} />
        <meshStandardMaterial color={screenColor} roughness={0.1} metalness={0.5} />
      </mesh>
      
      {/* TV Frame */}
      <mesh position={[0, 1.1, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.1, 0.05]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Cabinet Doors */}
      <mesh position={[-0.6, 0.5, 0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.03]} />
        <meshStandardMaterial color={cabinetColor} roughness={0.7} />
      </mesh>
      
      <mesh position={[0, 0.5, 0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.03]} />
        <meshStandardMaterial color={cabinetColor} roughness={0.7} />
      </mesh>
      
      <mesh position={[0.6, 0.5, 0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.03]} />
        <meshStandardMaterial color={cabinetColor} roughness={0.7} />
      </mesh>
      
      {/* Door Handles */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0.28]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.03, 0.03]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      
      {/* Cabinet Legs */}
      {[
        [-0.8, 0.15, 0.2],
        [0.8, 0.15, 0.2],
        [-0.8, 0.15, -0.2],
        [0.8, 0.15, -0.2],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      ))}
      
      {/* Optional: Add a potted plant on top */}
      <group position={[0.7, 0.85, 0]}>
        {/* Pot */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
        
        {/* Plant */}
        <group position={[0, 0.3, 0]}>
          {/* Main stem */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
            <meshStandardMaterial color="#4d8c57" />
          </mesh>
          
          {/* Leaves */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const height = 0.05 + (i % 6) * 0.05;
            const radius = 0.1 + (i % 3) * 0.05;
            
            return (
              <mesh 
                key={i} 
                position={[
                  Math.cos(angle) * radius, 
                  height, 
                  Math.sin(angle) * radius
                ]} 
                rotation={[
                  Math.random() * 0.5,
                  angle,
                  Math.random() * 0.3
                ]}
                castShadow
              >
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#4CAF50" />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  )
}