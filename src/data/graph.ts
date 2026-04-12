import type { RepoEdgeData, RepoGraph, RepoNodeData, RepoTreeEntry } from './types.ts'

interface MutableNode {
  id: string
  path: string
  name: string
  kind: 'file' | 'folder'
  depth: number
  size: number
  extension: string
}

function hashToUnit(value: string): number {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash % 1000) / 1000
}

function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return parts.join('/')
}

function ensureFolderNode(nodes: Map<string, MutableNode>, folderPath: string): void {
  if (!folderPath || nodes.has(folderPath)) {
    return
  }

  ensureFolderNode(nodes, getParentPath(folderPath))

  const parts = folderPath.split('/')
  const name = parts[parts.length - 1]

  nodes.set(folderPath, {
    id: folderPath,
    path: folderPath,
    name,
    kind: 'folder',
    depth: parts.length,
    size: 1,
    extension: '',
  })
}

function extensionForPath(path: string): string {
  const parts = path.split('.')
  return parts.length > 1 ? parts.pop() ?? '' : ''
}

export function buildRepoGraph(treeEntries: RepoTreeEntry[]): RepoGraph {
  const nodes = new Map<string, MutableNode>()
  const edges: RepoEdgeData[] = []

  nodes.set('', {
    id: '',
    path: '',
    name: 'root',
    kind: 'folder',
    depth: 0,
    size: 1,
    extension: '',
  })

  for (const entry of treeEntries) {
    const normalizedPath = entry.path.replace(/^\/+|\/+$/g, '')
    const parentPath = getParentPath(normalizedPath)

    if (parentPath) {
      ensureFolderNode(nodes, parentPath)
    }

    const pathParts = normalizedPath.split('/').filter(Boolean)

    nodes.set(normalizedPath, {
      id: normalizedPath,
      path: normalizedPath,
      name: pathParts[pathParts.length - 1] ?? normalizedPath,
      kind: entry.type === 'tree' ? 'folder' : 'file',
      depth: pathParts.length,
      size: entry.size ?? 1,
      extension: entry.type === 'blob' ? extensionForPath(normalizedPath) : '',
    })
  }

  const allNodes = Array.from(nodes.values())

  for (const node of allNodes) {
    if (node.path === '') {
      continue
    }

    const parentPath = getParentPath(node.path)
    const source = nodes.has(parentPath) ? parentPath : ''

    edges.push({
      id: `${source}->${node.path}`,
      source,
      target: node.path,
    })
  }

  const depthGroups = new Map<number, MutableNode[]>()
  for (const node of allNodes) {
    const group = depthGroups.get(node.depth)
    if (group) {
      group.push(node)
    } else {
      depthGroups.set(node.depth, [node])
    }
  }

  const positionedNodes: RepoNodeData[] = []

  for (const node of allNodes) {
    if (node.path === '') {
      positionedNodes.push({
        ...node,
        position: [0, 0, 0],
      })
      continue
    }

    const siblings = depthGroups.get(node.depth) ?? []
    const index = Math.max(
      0,
      siblings.findIndex((item) => item.path === node.path),
    )
    const angle = (index / Math.max(1, siblings.length)) * Math.PI * 2
    const radialBase = 3 + node.depth * 2.3
    const radialJitter = hashToUnit(node.path) * 1.4
    const radius = radialBase + radialJitter
    const height = (hashToUnit(`${node.path}-z`) - 0.5) * (2.5 + node.depth * 0.35)

    positionedNodes.push({
      ...node,
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
    })
  }

  return {
    nodes: positionedNodes,
    edges,
  }
}
