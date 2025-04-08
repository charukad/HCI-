interface SideTableProps {
  color: string
}

export default function SideTable({ color }: SideTableProps) {
  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Leg */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

