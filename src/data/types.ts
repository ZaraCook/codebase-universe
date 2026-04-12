export type TreeEntryType = 'tree' | 'blob'

export interface RepoMeta {
  id: number
  name: string
  fullName: string
  owner: string
  description: string | null
  stars: number
  forks: number
  defaultBranch: string
  htmlUrl: string
}

export interface RepoTreeEntry {
  path: string
  type: TreeEntryType
  size?: number
  sha: string
}

export interface RepoNodeData {
  id: string
  path: string
  name: string
  kind: 'file' | 'folder'
  depth: number
  size: number
  extension: string
  position: [number, number, number]
}

export interface RepoEdgeData {
  id: string
  source: string
  target: string
}

export interface RepoGraph {
  nodes: RepoNodeData[]
  edges: RepoEdgeData[]
}

export interface RepositorySnapshot {
  repository: RepoMeta
  branches: string[]
  activeBranch: string
  tree: RepoTreeEntry[]
}
