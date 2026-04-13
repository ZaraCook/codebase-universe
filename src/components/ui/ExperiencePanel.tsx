import { motion } from 'framer-motion'

interface ExperiencePanelProps {
  search: string
  onSearchChange: (value: string) => void
  kindFilter: 'all' | 'file' | 'folder'
  onKindFilterChange: (value: 'all' | 'file' | 'folder') => void
  extensionFilter: string
  extensionOptions: string[]
  onExtensionFilterChange: (value: string) => void
  maxNodes: number
  onMaxNodesChange: (value: number) => void
  autoRotate: boolean
  onAutoRotateChange: (value: boolean) => void
  showLabels: boolean
  onShowLabelsChange: (value: boolean) => void
  bloomStrength: number
  onBloomStrengthChange: (value: number) => void
  cinematicMode: boolean
  onCinematicModeChange: (value: boolean) => void
  followSelection: boolean
  onFollowSelectionChange: (value: boolean) => void
  motionSpeed: number
  onMotionSpeedChange: (value: number) => void
}

export function ExperiencePanel({
  search,
  onSearchChange,
  kindFilter,
  onKindFilterChange,
  extensionFilter,
  extensionOptions,
  onExtensionFilterChange,
  maxNodes,
  onMaxNodesChange,
  autoRotate,
  onAutoRotateChange,
  showLabels,
  onShowLabelsChange,
  bloomStrength,
  onBloomStrengthChange,
  cinematicMode,
  onCinematicModeChange,
  followSelection,
  onFollowSelectionChange,
  motionSpeed,
  onMotionSpeedChange,
}: ExperiencePanelProps) {
  return (
    <motion.section
      className="experience-panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
    >
      <label>
        Search Nodes
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="path, filename, extension"
          aria-label="Search Nodes"
        />
      </label>

      <label>
        Kind
        <select
          value={kindFilter}
          onChange={(event) => onKindFilterChange(event.target.value as 'all' | 'file' | 'folder')}
          aria-label="Node Kind Filter"
        >
          <option value="all">All</option>
          <option value="file">Files</option>
          <option value="folder">Folders</option>
        </select>
      </label>

      <label>
        Extension
        <select
          value={extensionFilter}
          onChange={(event) => onExtensionFilterChange(event.target.value)}
          aria-label="File Extension Filter"
        >
          <option value="all">All</option>
          {extensionOptions.map((extension) => (
            <option key={extension} value={extension}>
              .{extension}
            </option>
          ))}
        </select>
      </label>

      <label>
        Max Nodes
        <input
          type="number"
          min={50}
          max={8000}
          step={50}
          value={maxNodes}
          onChange={(event) => onMaxNodesChange(Number(event.target.value) || 50)}
          aria-label="Max Nodes"
        />
      </label>

      <label>
        Bloom
        <input
          type="range"
          min={0}
          max={2}
          step={0.05}
          value={bloomStrength}
          onChange={(event) => onBloomStrengthChange(Number(event.target.value))}
          aria-label="Bloom Strength"
        />
      </label>

      <label>
        Motion Speed
        <input
          type="range"
          min={0.2}
          max={2.4}
          step={0.05}
          value={motionSpeed}
          onChange={(event) => onMotionSpeedChange(Number(event.target.value))}
          aria-label="Motion Speed"
        />
      </label>

      <label className="toggle">
        <input
          type="checkbox"
          checked={cinematicMode}
          onChange={(event) => onCinematicModeChange(event.target.checked)}
        />
        Cinematic FX
      </label>

      <label className="toggle">
        <input
          type="checkbox"
          checked={followSelection}
          onChange={(event) => onFollowSelectionChange(event.target.checked)}
        />
        Follow Selection
      </label>

      <label className="toggle">
        <input
          type="checkbox"
          checked={autoRotate}
          onChange={(event) => onAutoRotateChange(event.target.checked)}
        />
        Auto Rotate
      </label>

      <label className="toggle">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(event) => onShowLabelsChange(event.target.checked)}
        />
        Show Labels
      </label>
    </motion.section>
  )
}
