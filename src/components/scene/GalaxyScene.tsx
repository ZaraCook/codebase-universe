import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
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
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 8, 5]} intensity={1.4} />
      <pointLight position={[-10, -4, -8]} intensity={0.55} color="#0ea5e9" />

      <StarsBackground />
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
