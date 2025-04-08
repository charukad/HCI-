interface DiningTableProps {
  color: string
}

export default function DiningTable({ color }: DiningTableProps) {
  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      {[
        [-0.9, 0.4, 0.5],
        [0.9, 0.4, 0.5],
        [-0.9, 0.4, -0.5],
        [0.9, 0.4, -0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

