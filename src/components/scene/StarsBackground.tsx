import { Stars } from '@react-three/drei'

export function StarsBackground() {
	return (
		<Stars
			radius={160}
			depth={56}
			count={7000}
			factor={3}
			saturation={0}
			fade
			speed={0.7}
		/>
	)
}

