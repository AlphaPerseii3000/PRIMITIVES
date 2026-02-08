import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../../store';
import { Particle } from './Particle';

/**
 * ParticleSystem component.
 * Renders all active particles from the simulation store.
 */
export function ParticleSystem() {
    // Get all node IDs (Map iterator to array)
    // We use useShallow to prevent infinite re-renders since Array.from creates a new reference
    const nodeIds = useStore(useShallow(s => Array.from(s.nodes.keys())));

    return (
        <group name="particle-system">
            {nodeIds.map(id => (
                <Particle key={id} id={id} />
            ))}
        </group>
    );
}
