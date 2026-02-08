import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/**
 * Camera controls for the 3D scene.
 * Uses OrbitControls from @react-three/drei with sensible defaults and limits.
 * 
 * @param props - Component properties (none currently required)
 */
export function Controls() {
    const controlsRef = useRef<OrbitControlsImpl>(null);

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault // Support for drei camera helpers
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={50}
        />
    );
}
