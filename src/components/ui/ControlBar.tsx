import { motion } from 'framer-motion'

interface ControlBarProps {
  repoUrl: string
  onRepoUrlChange: (value: string) => void
  branches: string[]
  selectedBranch: string
  onBranchChange: (value: string) => void
  onLoad: () => void
  isLoading: boolean
}

export function ControlBar({
  repoUrl,
  onRepoUrlChange,
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
