import { Stars } from '@react-three/drei'

export function StarsBackground() {
	return (
		<Stars
			radius={220}
			depth={72}
			count={9200}
			factor={4.2}
			saturation={0}
			fade
			speed={0.45}
		/>
	)
}

