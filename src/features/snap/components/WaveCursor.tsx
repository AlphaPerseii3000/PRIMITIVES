/**
 * WaveCursor Component
 * 
 * Visual indicator showing player position in wave mode.
 * Animates scale and emissive intensity based on velocity for dynamic feedback.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';
import { useWaveStore, selectNormalizedSpeed } from '../wave.store';
import {
    CURSOR_BASE_SCALE,
    CURSOR_SCALE_BOOST,
    CURSOR_EMISSIVE_BASE,
    CURSOR_EMISSIVE_BOOST,
    CURSOR_COLOR
} from '../wave.constants';

// ============================================================================
// Geometry Constants
// ============================================================================
const RING_INNER_RADIUS = 0.8;
const RING_OUTER_RADIUS = 1.0;
const RING_SEGMENTS = 32;

export interface WaveCursorProps {
    /** Y position of the cursor (height above XZ plane) */
    height?: number;
}

/**
 * Visual cursor that follows the player's wave position.
 * 
 * Features:
 * - Ring geometry that sits on the XZ plane
 * - Scale animation: grows when moving fast
 * - Emissive animation: brighter when moving (selective bloom)
 * - Position updates via ref for performance (no useState in useFrame)
 * 
 * @example
 * ```tsx
 * <WaveCursor height={0.1} />
 * ```
 */
export const WaveCursor = ({ height = 0.1 }: WaveCursorProps) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshStandardMaterial>(null);

    // Use useFrame for continuous updates without triggering re-renders
    useFrame(() => {
        if (!meshRef.current || !materialRef.current) return;

        // Get current state directly from store (not via hook to avoid re-renders)
        const state = useWaveStore.getState();
        const { position } = state;
        const normalizedSpeed = selectNormalizedSpeed(state);

        // Update position (XZ plane, constant Y height)
        meshRef.current.position.set(position.x, height, position.z);

        // Animate scale based on speed (bigger when moving)
        const scale = CURSOR_BASE_SCALE + normalizedSpeed * CURSOR_SCALE_BOOST;
        meshRef.current.scale.setScalar(scale);

        // Animate emissive for bloom (brighter when moving)
        const intensity = CURSOR_EMISSIVE_BASE + normalizedSpeed * CURSOR_EMISSIVE_BOOST;
        materialRef.current.emissiveIntensity = intensity;
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[RING_INNER_RADIUS, RING_OUTER_RADIUS, RING_SEGMENTS]} />
            <meshStandardMaterial
                ref={materialRef}
                color={CURSOR_COLOR}
                emissive={CURSOR_COLOR}
                emissiveIntensity={CURSOR_EMISSIVE_BASE}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
};
