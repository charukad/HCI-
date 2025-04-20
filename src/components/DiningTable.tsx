interface DiningTableProps {
  color: string
}

export default function DiningTable({ color }: DiningTableProps) {
  // Use a lighter wood color for coffee table
  const woodColor = "#f0d9b5"; // Lighter wood color similar to the reference image
  
  return (
    <group>
      {/* Table top - make it circular like in the reference */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
        <meshStandardMaterial color={woodColor} />
      </mesh>

      {/* Table rim */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.92, 0.92, 0.02, 32]} />
        <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Table legs - use angled legs like in modern design */}
      {[45, 135, 225, 315].map((angle, i) => {
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * 0.5;
        const z = Math.sin(radians) * 0.5;
        const legTilt = (angle * Math.PI) / 180;
        
        return (
          <mesh 
            key={i} 
            position={[x * 0.8, 0.18, z * 0.8]} 
            rotation={[0, -legTilt + Math.PI, 0.1]} 
            castShadow 
            receiveShadow
          >
            <cylinderGeometry args={[0.03, 0.03, 0.35]} />
            <meshStandardMaterial color={woodColor} />
          </mesh>
        );
      })}

      {/* Optional: Add a small plant or object on top */}
      <group position={[0, 0.40, 0]}>
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
        {/* Simple plant */}
        <group position={[0, 0.1, 0]}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * 0.05;
            const z = Math.sin(rad) * 0.05;
            return (
              <mesh key={i} position={[x, 0.06 * (i % 3), z]} rotation={[0.3, 0, 0.3]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#4CAF50" />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  )
}