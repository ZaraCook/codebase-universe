import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import { ControlBar } from './components/ui/ControlBar.tsx'
import { ExperiencePanel } from './components/ui/ExperiencePanel.tsx'
import { FilePanel } from './components/ui/FilePanel.tsx'
import { RepoStatus } from './components/ui/RepoStatus.tsx'
import { GalaxyScene } from './components/scene/GalaxyScene.tsx'
import { buildRepoGraph } from './data/graph.ts'
import {
  fetchFileContent,
  fetchRepositorySnapshot,
  fetchViewerRepositories,
  parseGitHubRepoUrl,
} from './data/github.ts'
import type {
  GitHubRepoOption,
  RepoGraph,
  RepoNodeData,
  RepositorySnapshot,
} from './data/types.ts'

const DEFAULT_REPO_URL = 'https://github.com/ZaraCook/test-jira.git'

export default function App() {
  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL)
  const [snapshot, setSnapshot] = useState<RepositorySnapshot | null>(null)
  const [graph, setGraph] = useState<RepoGraph | null>(null)
  const [branches, setBranches] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedNode, setSelectedNode] = useState<RepoNodeData | null>(null)
  const [selectedNodeContent, setSelectedNodeContent] = useState<string>('')
  const [repoOptions, setRepoOptions] = useState<GitHubRepoOption[]>([])
  const [selectedRepoUrl, setSelectedRepoUrl] = useState('')
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingFile, setIsLoadingFile] = useState(false)
  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState<'all' | 'file' | 'folder'>('all')
  const [extensionFilter, setExtensionFilter] = useState('all')
  const [maxNodes, setMaxNodes] = useState(2000)
  const [autoRotate, setAutoRotate] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [bloomStrength, setBloomStrength] = useState(0.9)
  const [cinematicMode, setCinematicMode] = useState(true)
  const [followSelection, setFollowSelection] = useState(true)
  const [motionSpeed, setMotionSpeed] = useState(1)
  const [focusPath, setFocusPath] = useState('')
  const [focusHistory, setFocusHistory] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const githubToken = import.meta.env.VITE_GITHUB_TOKEN?.trim() || undefined

  const stats = useMemo(() => {
    if (!graph) {
      return {
        files: 0,
        folders: 0,
        edges: 0,
      }
    }

    const folders = graph.nodes.filter((node) => node.kind === 'folder').length
    return {
      files: graph.nodes.length - folders,
      folders,
      edges: graph.edges.length,
    }
  }, [graph])

  const scopedGraph = useMemo(() => {
    if (!graph) {
      return { nodes: [], edges: [] }
    }

    if (!focusPath) {
      return graph
    }

    const focusNode = graph.nodes.find((node) => node.path === focusPath)

    if (!focusNode) {
      return graph
    }

    const scopedNodes = graph.nodes
      .filter((node) => node.path === focusPath || node.path.startsWith(`${focusPath}/`))
      .map((node) => ({
        ...node,
        depth: Math.max(0, node.depth - focusNode.depth),
        position: [
          node.position[0] - focusNode.position[0],
          node.position[1] - focusNode.position[1],
          node.position[2] - focusNode.position[2],
        ] as [number, number, number],
      }))

    const nodeIds = new Set(scopedNodes.map((node) => node.id))
    const scopedEdges = graph.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    )

    return {
      nodes: scopedNodes,
      edges: scopedEdges,
    }
  }, [focusPath, graph])

  const extensionOptions = useMemo(() => {
    if (!scopedGraph.nodes.length) {
      return []
    }

    const set = new Set<string>()
    scopedGraph.nodes.forEach((node) => {
      if (node.kind === 'file' && node.extension) {
        set.add(node.extension.toLowerCase())
      }
    })

    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [scopedGraph])

  const filteredGraph = useMemo(() => {
    if (!scopedGraph.nodes.length) {
      return { nodes: [], edges: [] }
    }

    const searchLower = search.trim().toLowerCase()
    const matchesSearch = (node: RepoNodeData) =>
      !searchLower ||
      node.name.toLowerCase().includes(searchLower) ||
      node.path.toLowerCase().includes(searchLower) ||
      node.extension.toLowerCase().includes(searchLower)

    const nodes = scopedGraph.nodes
      .filter((node) => (kindFilter === 'all' ? true : node.kind === kindFilter))
      .filter((node) =>
        extensionFilter === 'all' ? true : node.kind === 'file' && node.extension === extensionFilter,
      )
      .filter(matchesSearch)
      .sort((a, b) => a.depth - b.depth)
      .slice(0, Math.max(50, maxNodes))

    const visibleIds = new Set(nodes.map((node) => node.id))
    const edges = scopedGraph.edges.filter(
      (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
    )

    return { nodes, edges }
  }, [extensionFilter, kindFilter, maxNodes, scopedGraph, search])

  const loadRepository = async (nextBranch?: string) => {
    const parsed = parseGitHubRepoUrl(repoUrl)

    if (!parsed) {
      setError('Please enter a valid GitHub repository URL.')
      return
    }

    setError('')
    setIsLoading(true)
    setSelectedNode(null)
    setSelectedNodeContent('')

    try {
      const repoSnapshot = await fetchRepositorySnapshot({
        owner: parsed.owner,
        repo: parsed.repo,
        branch: nextBranch || selectedBranch || undefined,
        token: githubToken,
      })

      const nextGraph = buildRepoGraph(repoSnapshot.tree)

      setSnapshot(repoSnapshot)
      setBranches(repoSnapshot.branches)
      setSelectedBranch(repoSnapshot.activeBranch)
      setGraph(nextGraph)
      setFocusPath('')
      setFocusHistory([])
    } catch (loadError) {
      setSnapshot(null)
      setGraph(null)
      setBranches([])
      setSelectedBranch('')
      setError(loadError instanceof Error ? loadError.message : 'Failed to load repository.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNodeSelect = async (node: RepoNodeData) => {
    setSelectedNode(node)
    setSelectedNodeContent('')

    if (node.kind !== 'file') {
      return
    }

    if (!snapshot) {
      return
    }

    setIsLoadingFile(true)

    try {
      const content = await fetchFileContent({
        owner: snapshot.repository.owner,
        repo: snapshot.repository.name,
        path: node.path,
        ref: snapshot.activeBranch,
        token: githubToken,
      })
      setSelectedNodeContent(content)
    } catch (fileError) {
      setSelectedNodeContent(
        fileError instanceof Error ? fileError.message : 'Unable to load file content.',
      )
    } finally {
      setIsLoadingFile(false)
    }
  }

  const enterSelectedGalaxy = () => {
    if (!selectedNode || selectedNode.kind !== 'folder') {
      return
    }

    if (focusPath === selectedNode.path) {
      return
    }

    setFocusHistory((previous) => [...previous, focusPath])
    setFocusPath(selectedNode.path)
    setSelectedNode(null)
    setSelectedNodeContent('')
  }

  const moveUpOneLevel = () => {
    if (!focusPath) {
      return
    }

    const parts = focusPath.split('/').filter(Boolean)
    parts.pop()
    const nextPath = parts.join('/')
    setFocusHistory((previous) => [...previous, focusPath])
    setFocusPath(nextPath)
    setSelectedNode(null)
    setSelectedNodeContent('')
  }

  const moveBack = () => {
    setFocusHistory((previous) => {
      if (previous.length === 0) {
        return previous
      }

      const copy = [...previous]
      const previousPath = copy.pop() ?? ''
      setFocusPath(previousPath)
      setSelectedNode(null)
      setSelectedNodeContent('')
      return copy
    })
  }

  const resetToRoot = () => {
    setFocusHistory((previous) => [...previous, focusPath])
    setFocusPath('')
    setSelectedNode(null)
    setSelectedNodeContent('')
  }

  const loadViewerRepositories = async () => {
    if (!githubToken) {
      setError('Missing VITE_GITHUB_TOKEN in .env. Add one to connect your GitHub account.')
      return
    }

    setError('')
    setIsLoadingRepos(true)

    try {
      const repos = await fetchViewerRepositories(githubToken)
      setRepoOptions(repos)

      if (repos.length > 0) {
        setSelectedRepoUrl(repos[0].url)
      }
    } catch (reposError) {
      setError(
        reposError instanceof Error ? reposError.message : 'Failed to load your repositories.',
      )
    } finally {
      setIsLoadingRepos(false)
    }
  }

  useEffect(() => {
    if (githubToken) {
      void loadViewerRepositories()
    }
    // We intentionally run this only once on startup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-shell">
      <div className="app-main">
        <header className="app-header">
          <h1>Codebase Universe</h1>
          <p>Explore repository files and folders as an interactive 3D galaxy.</p>
        </header>

        <ControlBar
          repoUrl={repoUrl}
          onRepoUrlChange={setRepoUrl}
          repoOptions={repoOptions}
          selectedRepoUrl={selectedRepoUrl}
          onSelectRepo={(url) => {
            setSelectedRepoUrl(url)
            setRepoUrl(url)
          }}
          onLoadMyRepos={() => void loadViewerRepositories()}
          isLoadingRepos={isLoadingRepos}
          hasToken={Boolean(githubToken)}
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchChange={(branch) => {
            setSelectedBranch(branch)
            void loadRepository(branch)
          }}
          onLoad={() => void loadRepository()}
          isLoading={isLoading}
        />

        <RepoStatus
          repository={snapshot?.repository ?? null}
          activeBranch={snapshot?.activeBranch ?? ''}
          rateLimited={!githubToken}
          connectedRepoCount={repoOptions.length}
          stats={stats}
          loading={isLoading}
          error={error}
        />

        <ExperiencePanel
          search={search}
          onSearchChange={setSearch}
          kindFilter={kindFilter}
          onKindFilterChange={setKindFilter}
          extensionFilter={extensionFilter}
          extensionOptions={extensionOptions}
          onExtensionFilterChange={setExtensionFilter}
          maxNodes={maxNodes}
          onMaxNodesChange={setMaxNodes}
          autoRotate={autoRotate}
          onAutoRotateChange={setAutoRotate}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          bloomStrength={bloomStrength}
          onBloomStrengthChange={setBloomStrength}
          cinematicMode={cinematicMode}
          onCinematicModeChange={setCinematicMode}
          followSelection={followSelection}
          onFollowSelectionChange={setFollowSelection}
          motionSpeed={motionSpeed}
          onMotionSpeedChange={setMotionSpeed}
        />

        <section className="scene-layout">
          <div className="scene-nav">
            <span>Current Galaxy: {focusPath || 'root'}</span>
            <div className="scene-nav-actions">
              <button type="button" onClick={moveBack} disabled={focusHistory.length === 0}>
                Back
              </button>
              <button type="button" onClick={moveUpOneLevel} disabled={!focusPath}>
                Up One
              </button>
              <button type="button" onClick={resetToRoot} disabled={!focusPath}>
                Root
              </button>
            </div>
          </div>

          <div className="scene-card">
            <GalaxyScene
              key={focusPath || 'root'}
              nodes={filteredGraph.nodes}
              edges={filteredGraph.edges}
              selectedNodeId={selectedNode?.id ?? null}
              onSelectNode={handleNodeSelect}
              autoRotate={autoRotate}
              showLabels={showLabels}
              bloomStrength={bloomStrength}
              cinematicMode={cinematicMode}
              followSelection={followSelection}
              motionSpeed={motionSpeed}
            />
          </div>

          <AnimatePresence mode="wait">
            <FilePanel
              key={selectedNode?.id ?? 'empty'}
              node={selectedNode}
              content={selectedNodeContent}
              loading={isLoadingFile}
              repositoryUrl={snapshot?.repository.htmlUrl ?? repoUrl}
              activeBranch={snapshot?.activeBranch ?? selectedBranch}
              onEnterGalaxy={enterSelectedGalaxy}
              canEnterGalaxy={Boolean(
                selectedNode &&
                  selectedNode.kind === 'folder' &&
                  selectedNode.path !== focusPath,
              )}
            />
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}