import { useCallback } from 'react';
import { useStore } from '../../../store';
import { useWaveStore } from '../../snap/wave.store';
import type { NodeId } from '../particle.types';

/**
 * Hook to spawn a particle at the current wave position.
 * Optimized to read position transiently to avoid re-renders.
 */
export function useSpawnParticle() {
    const addNode = useStore(s => s.addNode);

    const spawnParticle = useCallback((): NodeId | null => {
        // Read position transiently from store (no subscription)
        const wavePosition = useWaveStore.getState().position;

        // Convert 2D wave position {x, z} to 3D [x, 0, z]
        return addNode([wavePosition.x, 0, wavePosition.z]);
    }, [addNode]);

    return { spawnParticle };
}
