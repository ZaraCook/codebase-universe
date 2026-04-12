import type {
  GitHubRepoOption,
  RepoMeta,
  RepositorySnapshot,
  RepoTreeEntry,
} from './types.ts'

const GITHUB_API_BASE = 'https://api.github.com'

interface GitHubRepositoryResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  default_branch: string
  html_url: string
  owner: {
    login: string
  }
}

interface GitHubTreeResponse {
  tree: Array<{
    path: string
    type: 'tree' | 'blob'
    sha: string
    size?: number
  }>
  truncated: boolean
}

interface GitHubBranchResponse {
  name: string
}

interface GitHubFileResponse {
  content?: string
  encoding?: string
}

interface GitHubUserRepoResponse {
  id: number
  full_name: string
  html_url: string
  private: boolean
  description: string | null
}

interface RequestOptions {
  token?: string
}

interface SnapshotOptions extends RequestOptions {
  owner: string
  repo: string
  branch?: string
}

interface FileContentOptions extends RequestOptions {
  owner: string
  repo: string
  path: string
  ref: string
}

export interface ParsedRepoUrl {
  owner: string
  repo: string
}

export function parseGitHubRepoUrl(input: string): ParsedRepoUrl | null {
  const normalized = input.trim().replace(/\.git$/, '')

  try {
    if (!normalized.startsWith('http')) {
      return null
    }

    const url = new URL(normalized)

    if (url.hostname !== 'github.com') {
      return null
    }

    const [owner, repo] = url.pathname.split('/').filter(Boolean)

    if (!owner || !repo) {
      return null
    }

    return { owner, repo }
  } catch {
    return null
  }
}

async function githubRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(`${GITHUB_API_BASE}${path}`, { headers })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `GitHub API request failed (${response.status}): ${body || response.statusText}`,
    )
  }

  return (await response.json()) as T
}

export async function fetchRepositorySnapshot(
  options: SnapshotOptions,
): Promise<RepositorySnapshot> {
  const { owner, repo, branch, token } = options
  const repository = await githubRequest<GitHubRepositoryResponse>(`/repos/${owner}/${repo}`, {
    token,
  })

  const branchesRes = await githubRequest<GitHubBranchResponse[]>(
    `/repos/${owner}/${repo}/branches?per_page=100`,
    { token },
  )
  const branches = branchesRes.map((item) => item.name)

  const activeBranch = branch || repository.default_branch

  const tree = await githubRequest<GitHubTreeResponse>(
    `/repos/${owner}/${repo}/git/trees/${activeBranch}?recursive=1`,
    { token },
  )

  const mappedRepo: RepoMeta = {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    owner: repository.owner.login,
    description: repository.description,
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    defaultBranch: repository.default_branch,
    htmlUrl: repository.html_url,
  }

  const mappedTree: RepoTreeEntry[] = tree.tree
    .filter((entry) => entry.type === 'blob' || entry.type === 'tree')
    .map((entry) => ({
      path: entry.path,
      type: entry.type,
      sha: entry.sha,
      size: entry.size,
    }))

  return {
    repository: mappedRepo,
    branches,
    activeBranch,
    tree: mappedTree,
  }
}

export async function fetchFileContent(options: FileContentOptions): Promise<string> {
  const encodedPath = options.path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  const file = await githubRequest<GitHubFileResponse>(
    `/repos/${options.owner}/${options.repo}/contents/${encodedPath}?ref=${encodeURIComponent(options.ref)}`,
    { token: options.token },
  )

  if (!file.content || file.encoding !== 'base64') {
    throw new Error('GitHub returned an unsupported file payload.')
  }

  return atob(file.content.replace(/\n/g, ''))
}

export async function fetchViewerRepositories(token: string): Promise<GitHubRepoOption[]> {
  if (!token) {
    throw new Error('A GitHub token is required to load your repositories.')
  }

  const repos = await githubRequest<GitHubUserRepoResponse[]>(
    '/user/repos?per_page=100&sort=updated&type=owner',
    { token },
  )

  return repos.map((repo) => ({
    id: repo.id,
    fullName: repo.full_name,
    url: repo.html_url,
    private: repo.private,
    description: repo.description,
  }))
}
