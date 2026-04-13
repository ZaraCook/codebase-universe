import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { Group, Vector2, Vector3 } from 'three'
import { BlendFunction } from 'postprocessing'
import type { RepoEdgeData, RepoNodeData } from '../../data/types.ts'
import { RepoConnections } from './RepoConnections.tsx'
import { RepoNode } from './RepoNode.tsx'
import { StarsBackground } from './StarsBackground.tsx'

function OrbitalAccents({ motionSpeed }: { motionSpeed: number }) {
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return
    }
    groupRef.current.rotation.y = clock.getElapsedTime() * (0.16 * motionSpeed)
  })

  return (
    <group ref={groupRef}>
      <mesh position={[8, 1.2, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#fda4af" />
      </mesh>
      <mesh position={[-12, -2.8, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[11, 0.02, 8, 120]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.32} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[16, 0.02, 8, 120]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

function CameraPilot({
  focusPosition,
  followSelection,
}: {
  focusPosition: [number, number, number] | null
  followSelection: boolean
}) {
  const { camera } = useThree()

  useFrame(() => {
    if (!followSelection || !focusPosition) {
      return
    }

    const focus = new Vector3(focusPosition[0], focusPosition[1], focusPosition[2])
    const desired = focus.clone().add(new Vector3(7, 4.5, 7))
    camera.position.lerp(desired, 0.04)
    camera.lookAt(focus)
  })

  return null
}

function ShootingComets({ motionSpeed }: { motionSpeed: number }) {
  const group = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) {
      return
    }

    group.current.rotation.y = clock.getElapsedTime() * 0.22 * motionSpeed
  })

  return (
    <group ref={group}>
      {[0, 1, 2, 3].map((idx) => {
        const angle = (idx / 4) * Math.PI * 2
        const radius = 22 + idx * 5
        return (
          <mesh key={`comet-${idx}`} position={[Math.cos(angle) * radius, 1 + idx * 0.6, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.12 + idx * 0.03, 14, 14]} />
            <meshBasicMaterial color={idx % 2 === 0 ? '#22d3ee' : '#fda4af'} />
          </mesh>
        )
      })}
    </group>
  )
}

interface GalaxySceneProps {
  nodes: RepoNodeData[]
  edges: RepoEdgeData[]
  selectedNodeId: string | null
  onSelectNode: (node: RepoNodeData) => void
  autoRotate: boolean
  showLabels: boolean
  bloomStrength: number
  cinematicMode: boolean
  followSelection: boolean
  motionSpeed: number
}

export function GalaxyScene({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  autoRotate,
  showLabels,
  bloomStrength,
  cinematicMode,
  followSelection,
  motionSpeed,
}: GalaxySceneProps) {
  const selectedNode = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : null

  return (
    <Canvas camera={{ position: [0, 10, 24], fov: 54 }}>
      <color attach="background" args={['#01030c']} />
      <fog attach="fog" args={['#030712', 25, 95]} />
      <ambientLight intensity={0.38} />
      <directionalLight position={[8, 10, 5]} intensity={1.15} color="#67e8f9" />
      <pointLight position={[-10, -4, -8]} intensity={0.75} color="#38bdf8" />
      <pointLight position={[6, 6, 10]} intensity={0.65} color="#c4b5fd" />

      <StarsBackground />
      <Sparkles count={220} scale={95} size={1.25} speed={0.28} color="#cbd5e1" />
      <OrbitalAccents motionSpeed={motionSpeed} />
      <ShootingComets motionSpeed={motionSpeed} />

      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.7, 2]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.95}
            transparent
            opacity={0.72}
            roughness={0.18}
            metalness={0.5}
          />
        </mesh>
      </Float>

      <RepoConnections nodes={nodes} edges={edges} selectedNodeId={selectedNodeId} />

      <group>
        {nodes.map((node) => (
          <RepoNode
            key={node.id || 'root'}
            node={node}
            selected={selectedNodeId === node.id}
            showLabel={showLabels}
            onSelect={onSelectNode}
          />
        ))}
      </group>

      <OrbitControls
        enablePan
        enableRotate
        enableZoom
        minDistance={4}
        maxDistance={72}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55 * motionSpeed}
      />

      <CameraPilot
        focusPosition={selectedNode?.position ?? null}
        followSelection={followSelection}
      />

      <EffectComposer>
        <Bloom intensity={bloomStrength} luminanceThreshold={0.28} luminanceSmoothing={0.6} />
        <Vignette eskil={false} offset={0.12} darkness={0.72} />
        <ChromaticAberration
          offset={cinematicMode ? new Vector2(0.0009, 0.0012) : new Vector2(0, 0)}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise
          premultiply
          blendFunction={BlendFunction.SOFT_LIGHT}
          opacity={cinematicMode ? 0.12 : 0}
        />
      </EffectComposer>
    </Canvas>
  )
}
