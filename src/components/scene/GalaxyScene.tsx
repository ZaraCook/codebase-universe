import { Canvas } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles } from '@react-three/drei'
import type { RepoEdgeData, RepoNodeData } from '../../data/types.ts'
import { RepoConnections } from './RepoConnections.tsx'
import { RepoNode } from './RepoNode.tsx'
import { StarsBackground } from './StarsBackground.tsx'

interface GalaxySceneProps {
  nodes: RepoNodeData[]
  edges: RepoEdgeData[]
  selectedNodeId: string | null
  onSelectNode: (node: RepoNodeData) => void
}

export function GalaxyScene({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}: GalaxySceneProps) {
  return (
    <Canvas camera={{ position: [0, 10, 24], fov: 54 }}>
      <color attach="background" args={['#01030c']} />
      <fog attach="fog" args={['#030712', 25, 95]} />
      <ambientLight intensity={0.38} />
      <directionalLight position={[8, 10, 5]} intensity={1.15} color="#67e8f9" />
      <pointLight position={[-10, -4, -8]} intensity={0.75} color="#38bdf8" />
      <pointLight position={[6, 6, 10]} intensity={0.65} color="#c4b5fd" />

      <StarsBackground />
      <Sparkles count={220} scale={95} size={1.25} speed={0.28} color="#cbd5e1" />

      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.7, 2]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.95}
            transparent
            opacity={0.72}
            roughness={0.18}
            metalness={0.5}
          />
        </mesh>
      </Float>

      <RepoConnections nodes={nodes} edges={edges} />

      <group>
        {nodes.map((node) => (
          <RepoNode
            key={node.id || 'root'}
            node={node}
            selected={selectedNodeId === node.id}
            onSelect={onSelectNode}
          />
        ))}
      </group>

      <OrbitControls enablePan enableRotate enableZoom minDistance={4} maxDistance={72} />
    </Canvas>
  )
}
