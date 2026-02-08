import { useSpawnParticle } from '../hooks/useSpawnParticle';
import type { ThreeEvent } from '@react-three/fiber';

/**
 * Capture clicks on an invisible plane to spawn particles.
 * Currently uses Left Click for MVP.
 */
export function SpawnInput() {
    const { spawnParticle } = useSpawnParticle();

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        // Stop propagation to prevent multiple triggers if nested
        e.stopPropagation();

        // Only trigger on left click (button 0)
        if (e.button === 0) {
            spawnParticle();
        }
    };

    return (
        <mesh
            name="spawn-input-plane"
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]} // Slightly below 0 to avoid Z-fighting if other planes exist
            onPointerDown={handleClick}
            visible={false} // Hidden input mesh
        >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    );
}
