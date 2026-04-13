import { useRef, useState } from 'react'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { RepoNodeData } from '../../data/types.ts'

interface RepoNodeProps {
  node: RepoNodeData
  selected: boolean
  showLabel: boolean
  onSelect: (node: RepoNodeData) => void
}

export function RepoNode({ node, selected, showLabel, onSelect }: RepoNodeProps) {
  const ref = useRef<Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!ref.current) {
      return
    }

    const pulse = selected ? 1.2 : 1
    const breathing = 1 + Math.sin(clock.getElapsedTime() * 2 + node.depth) * 0.03
    ref.current.scale.setScalar(pulse * breathing)
  })

  const radius = node.kind === 'folder' ? 0.28 : 0.17
  const extensionPalette: Record<string, string> = {
    ts: '#60a5fa',
    tsx: '#93c5fd',
    js: '#facc15',
    jsx: '#fde68a',
    json: '#f59e0b',
    md: '#34d399',
    css: '#38bdf8',
    html: '#fb7185',
    py: '#a78bfa',
  }
  const fileColor = extensionPalette[node.extension.toLowerCase()] ?? '#e2e8f0'
  const color = selected ? '#fb7185' : node.kind === 'folder' ? '#22d3ee' : fileColor
  const emissive = selected ? '#fb7185' : node.kind === 'folder' ? '#06b6d4' : '#334155'

  return (
    <group
      position={node.position}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(node)
      }}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={selected ? 0.95 : 0.4}
          metalness={0.25}
          roughness={0.2}
        />
      </mesh>

      {selected ? (
        <mesh>
          <sphereGeometry args={[radius * 1.9, 24, 24]} />
          <meshBasicMaterial color="#fb7185" transparent opacity={0.15} />
        </mesh>
      ) : null}

      {showLabel && (isHovered || selected) ? (
        <Html distanceFactor={9} position={[0, radius * 1.8, 0]}>
          <div className="node-label">{node.name}</div>
        </Html>
      ) : null}
    </group>
  )
}
