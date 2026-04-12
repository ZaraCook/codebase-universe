import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import { ControlBar } from './components/ui/ControlBar.tsx'
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

    if (node.kind !== 'file' || !snapshot) {
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

        <section className="scene-layout">
          <div className="scene-card">
            <GalaxyScene
              nodes={graph?.nodes ?? []}
              edges={graph?.edges ?? []}
              selectedNodeId={selectedNode?.id ?? null}
              onSelectNode={handleNodeSelect}
            />
          </div>

          <AnimatePresence mode="wait">
            <FilePanel
              key={selectedNode?.id ?? 'empty'}
              node={selectedNode}
              content={selectedNodeContent}
              loading={isLoadingFile}
            />
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}