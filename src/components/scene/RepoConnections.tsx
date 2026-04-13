import { Line } from '@react-three/drei'
import type { RepoEdgeData, RepoNodeData } from '../../data/types.ts'

interface RepoConnectionsProps {
  nodes: RepoNodeData[]
  edges: RepoEdgeData[]
  selectedNodeId: string | null
}

export function RepoConnections({ nodes, edges, selectedNodeId }: RepoConnectionsProps) {
  const index = new Map(nodes.map((node) => [node.id, node]))

  return (
    <group>
      {edges.map((edge) => {
        const source = index.get(edge.source)
        const target = index.get(edge.target)

        if (!source || !target) {
          return null
        }

        return (
          <Line
            key={edge.id}
            points={[source.position, target.position]}
            color={
              selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)
                ? '#fda4af'
                : '#64748b'
            }
            lineWidth={
              selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)
                ? 1.2
                : 0.65
            }
            transparent
            opacity={
              selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)
                ? 0.88
                : 0.42
            }
          />
        )
      })}
    </group>
  )
}
