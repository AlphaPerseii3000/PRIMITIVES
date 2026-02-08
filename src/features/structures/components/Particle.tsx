import { memo } from 'react';
import { useStore } from '../../../store';
import type { NodeId } from '../particle.types';
import {
    PARTICLE_RADIUS,
    PARTICLE_COLOR,
    PARTICLE_BLOOM_INTENSITY
} from '../particle.constants';

interface ParticleProps {
    id: NodeId;
}

/**
 * Individual Particle component.
 * Subscribes only to its own node in the store.
 */
export const Particle = memo(({ id }: ParticleProps) => {
    // Selective subscription for specific node data
    const node = useStore(s => s.nodes.get(id));

    // Fallback if node is not found (shouldn't happen with proper cleanup)
    if (!node) return null;

    return (
        <mesh position={node.position}>
            <sphereGeometry args={[PARTICLE_RADIUS, 32, 32]} />
            <meshStandardMaterial
                color={PARTICLE_COLOR}
                emissive={PARTICLE_COLOR}
                emissiveIntensity={PARTICLE_BLOOM_INTENSITY}
            />
        </mesh>
    );
});

Particle.displayName = 'Particle';
