import { motion } from 'framer-motion'
import type { RepoMeta } from '../../data/types.ts'

interface RepoStatusProps {
  repository: RepoMeta | null
  activeBranch: string
  rateLimited: boolean
  connectedRepoCount: number
  loading: boolean
  error: string
  stats: {
    files: number
    folders: number
    edges: number
  }
}

export function RepoStatus({
  repository,
  activeBranch,
  rateLimited,
  connectedRepoCount,
  loading,
  error,
  stats,
}: RepoStatusProps) {
  return (
    <motion.section
      className="repo-status"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 }}
    >
      <div>
        <span className="status-label">Repository</span>
        <strong>{repository?.fullName ?? 'Not loaded yet'}</strong>
        <p>{repository?.description ?? 'Load a repository to begin exploration.'}</p>
      </div>

      <div>
        <span className="status-label">Active Branch</span>
        <strong>{activeBranch || '-'}</strong>
        <p>
          {loading
            ? 'Fetching metadata and tree from GitHub API...'
            : rateLimited
              ? 'Using unauthenticated requests. Add a token to increase GitHub API limits.'
              : `Authenticated requests are enabled. ${connectedRepoCount} repos loaded from your account.`}
        </p>
      </div>

      <div>
        <span className="status-label">Graph Stats</span>
        <strong>
          {stats.files} files / {stats.folders} folders
        </strong>
        <p>{stats.edges} relationship edges rendered in 3D space.</p>
      </div>

      {error ? <div className="status-error">{error}</div> : null}
    </motion.section>
  )
}
