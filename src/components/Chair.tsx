interface ChairProps {
  color: string
}

export default function Chair({ color }: ChairProps) {
  return (
    <group>
      {/* Chair base/seat */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.15, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Chair cushion */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.1, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 0.85, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.9, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Backrest cushion */}
      <mesh position={[0, 0.85, -0.33]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Armrests */}
      <mesh position={[0.4, 0.6, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.1, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.4, 0.6, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.1, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      {[
        [-0.35, 0.175, 0.35],
        [0.35, 0.175, 0.35],
        [-0.35, 0.175, -0.35],
        [0.35, 0.175, -0.35],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.35]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  )
}