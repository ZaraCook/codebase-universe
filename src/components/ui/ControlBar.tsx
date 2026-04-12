import { motion } from 'framer-motion'
import type { GitHubRepoOption } from '../../data/types.ts'

interface ControlBarProps {
  repoUrl: string
  onRepoUrlChange: (value: string) => void
  repoOptions: GitHubRepoOption[]
  selectedRepoUrl: string
  onSelectRepo: (url: string) => void
  onLoadMyRepos: () => void
  isLoadingRepos: boolean
  hasToken: boolean
  branches: string[]
  selectedBranch: string
  onBranchChange: (value: string) => void
  onLoad: () => void
  isLoading: boolean
}

export function ControlBar({
  repoUrl,
  onRepoUrlChange,
  repoOptions,
  selectedRepoUrl,
  onSelectRepo,
  onLoadMyRepos,
  isLoadingRepos,
  hasToken,
  branches,
  selectedBranch,
  onBranchChange,
  onLoad,
  isLoading,
}: ControlBarProps) {
  return (
    <motion.div
      className="control-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <label>
        Your Repositories
        <select
          value={selectedRepoUrl}
          onChange={(event) => onSelectRepo(event.target.value)}
          disabled={!hasToken || isLoadingRepos || repoOptions.length === 0}
          aria-label="Your Repositories"
        >
          {repoOptions.length === 0 ? (
            <option value="">
              {hasToken ? 'Click Connect GitHub to load repos' : 'Add VITE_GITHUB_TOKEN in .env'}
            </option>
          ) : (
            repoOptions.map((repo) => (
              <option key={repo.id} value={repo.url}>
                {repo.fullName} {repo.private ? '(private)' : ''}
              </option>
            ))
          )}
        </select>
      </label>

      <button
        onClick={onLoadMyRepos}
        disabled={!hasToken || isLoadingRepos}
        type="button"
        className="secondary"
      >
        {isLoadingRepos ? 'Connecting...' : 'Connect GitHub'}
      </button>

      <label>
        Repository URL
        <input
          value={repoUrl}
          onChange={(event) => onRepoUrlChange(event.target.value)}
          placeholder="https://github.com/owner/repo"
          aria-label="Repository URL"
        />
      </label>

      <label>
        Branch
        <select
          value={selectedBranch}
          onChange={(event) => onBranchChange(event.target.value)}
          disabled={branches.length === 0 || isLoading}
          aria-label="Branch"
        >
          {branches.length === 0 ? (
            <option value="">Load a repository first</option>
          ) : (
            branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))
          )}
        </select>
      </label>

      <button onClick={onLoad} disabled={isLoading} type="button">
        {isLoading ? 'Loading...' : 'Load Galaxy'}
      </button>
    </motion.div>
  )
}
