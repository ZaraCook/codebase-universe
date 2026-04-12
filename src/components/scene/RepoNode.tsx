import { useRef } from 'react'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import type { RepoNodeData } from '../../data/types.ts'

interface RepoNodeProps {
  node: RepoNodeData
  selected: boolean
  onSelect: (node: RepoNodeData) => void
}

export function RepoNode({ node, selected, onSelect }: RepoNodeProps) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) {
      return
    }

    const pulse = selected ? 1.2 : 1
    const breathing = 1 + Math.sin(clock.getElapsedTime() * 2 + node.depth) * 0.03
    ref.current.scale.setScalar(pulse * breathing)
  })

  const radius = node.kind === 'folder' ? 0.24 : 0.16
  const color = selected ? '#f97316' : node.kind === 'folder' ? '#0ea5e9' : '#e2e8f0'

  return (
    <mesh
      ref={ref}
      position={node.position}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(node)
      }}
    >
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={selected ? '#ea580c' : node.kind === 'folder' ? '#0284c7' : '#334155'}
        emissiveIntensity={selected ? 0.75 : 0.28}
        metalness={0.2}
        roughness={0.35}
      />
    </mesh>
  )
}
