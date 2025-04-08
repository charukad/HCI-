interface ChairProps {
  color: string
}

export default function Chair({ color }: ChairProps) {
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 1.2, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.3, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      {[
        [-0.35, 0.25, 0.35],
        [0.35, 0.25, 0.35],
        [-0.35, 0.25, -0.35],
        [0.35, 0.25, -0.35],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

