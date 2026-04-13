import { motion } from 'framer-motion'
import type { RepoNodeData } from '../../data/types.ts'

interface FilePanelProps {
  node: RepoNodeData | null
  content: string
  loading: boolean
  repositoryUrl: string
  activeBranch: string
  onEnterGalaxy: () => void
  canEnterGalaxy: boolean
}

export function FilePanel({
  node,
  content,
  loading,
  repositoryUrl,
  activeBranch,
  onEnterGalaxy,
  canEnterGalaxy,
}: FilePanelProps) {
  const fileUrl =
    node && node.path
      ? `${repositoryUrl.replace(/\.git$/, '')}/blob/${encodeURIComponent(activeBranch || 'main')}/${node.path
          .split('/')
          .map((segment) => encodeURIComponent(segment))
          .join('/')}`
      : ''

  return (
    <motion.aside
      className="file-panel"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.25 }}
    >
      {!node ? (
        <div className="empty-state">
          <h3>Select a node</h3>
          <p>
            Click any node to inspect details first. For folders, use Enter Galaxy to drill into its
            sub-structure.
          </p>
        </div>
      ) : (
        <>
          <h3>{node.name}</h3>
          <dl>
            <div>
              <dt>Type</dt>
              <dd>{node.kind}</dd>
            </div>
            <div>
              <dt>Path</dt>
              <dd>{node.path || '/'}</dd>
            </div>
            <div>
              <dt>Depth</dt>
              <dd>{node.depth}</dd>
            </div>
            <div>
              <dt>Extension</dt>
              <dd>{node.extension || '-'}</dd>
            </div>
          </dl>

          <div className="panel-actions">
            <button
              type="button"
              onClick={() => {
                if (node?.path) {
                  void navigator.clipboard.writeText(node.path)
                }
              }}
            >
              Copy Path
            </button>

            {node.kind === 'folder' ? (
              <button type="button" onClick={onEnterGalaxy} disabled={!canEnterGalaxy}>
                {canEnterGalaxy ? 'Enter Galaxy' : 'Already In This Galaxy'}
              </button>
            ) : null}

            {node.kind === 'file' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (content) {
                      void navigator.clipboard.writeText(content)
                    }
                  }}
                  disabled={!content || loading}
                >
                  Copy Content
                </button>

                <a href={fileUrl} target="_blank" rel="noreferrer">
                  Open on GitHub
                </a>
              </>
            ) : null}
          </div>

          {node.kind === 'file' ? (
            <>
              <h4>Content</h4>
              <pre>{loading ? 'Loading file content from GitHub...' : content || 'No content returned.'}</pre>
            </>
          ) : (
            <p className="hint">Folders do not have direct file contents.</p>
          )}
        </>
      )}
    </motion.aside>
  )
}
