import { motion } from 'framer-motion'
import type { RepoNodeData } from '../../data/types.ts'

interface FilePanelProps {
  node: RepoNodeData | null
  content: string
  loading: boolean
}

export function FilePanel({ node, content, loading }: FilePanelProps) {
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
          <p>Click a file or folder in the galaxy to inspect details.</p>
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
