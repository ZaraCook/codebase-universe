import { Line } from '@react-three/drei'
import type { RepoEdgeData, RepoNodeData } from '../../data/types.ts'

interface RepoConnectionsProps {
  nodes: RepoNodeData[]
  edges: RepoEdgeData[]
}

export function RepoConnections({ nodes, edges }: RepoConnectionsProps) {
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
            color="#64748b"
            lineWidth={0.7}
            transparent
            opacity={0.5}
          />
        )
      })}
    </group>
  )
}
